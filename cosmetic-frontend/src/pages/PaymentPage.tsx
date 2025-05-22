import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookingDetails,
  BookingFormData,
  CartItem,
  Cosmetic,
} from "../types/type";
import { z } from "zod";
import apiCLient from "../services/apiServices";
import { paymentSchema } from "../types/validationBooking";
import AccordionSection from "../components/AccordionSection";

type FormData = {
  proof: File | null;
  cosmetic_ids: { id: number; quantity: number }[];
};

export default function PaymentPage() {
  const [formData, setFormData] = useState<FormData>({
    proof: null,
    cosmetic_ids: [],
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cosmeticDetails, setCosmeticDetails] = useState<Cosmetic[]>([]);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [formError, setFormError] = useState<z.ZodIssue[]>([]);

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);

  const TAX_RATE = 0.11;
  const navigate = useNavigate();

  const fetchCosmeticDetails = async (cartItems: CartItem[]) => {
    try {
      const fetchedDetails = await Promise.all(
        cartItems.map(async (item) => {
          const response = await apiCLient.get(`/cosmetic/${item.slug}`);
          return response.data.data;
        })
      );
      setCosmeticDetails(fetchedDetails);
      setLoading(false);

      const cosmeticIdsWithQuantities = cartItems.map((cartItem) => ({
        id: cartItem.cosmetic_id,
        quantity: cartItem.quantity,
      }));

      setFormData((prevData) => ({
        ...prevData,
        cosmetic_ids: cosmeticIdsWithQuantities,
      }));
    } catch (error) {
      console.error("Error fetching cosmetic details:", error);
      setError("Failed to fetch cosmetic details");
      setLoading(false);
    }
  };

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    const savedBookingData = localStorage.getItem("bookingData");

    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData) as BookingFormData);
    }

    if (!cartData || (cartData && JSON.parse(cartData).length === 0)) {
      navigate("/");
      return;
    }
    const cartItems = JSON.parse(cartData) as CartItem[];
    setCart(cartItems);
    fetchCosmeticDetails(cartItems);
  }, [navigate]);

  const subtotal = cosmeticDetails.reduce((acc, cosmetic) => {
    const cartItem = cart.find((item) => item.cosmetic_id === cosmetic.id);
    return acc + (cartItem ? cosmetic.price * cartItem.quantity : 0);
  }, 0);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({
      ...prev,
      proof: file,
    }));
    setFileName(file ? file.name : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = paymentSchema.safeParse(formData);

    if (!validation.success) {
      setFormError(validation.error.issues);
      return;
    }

    setFormError([]);

    const submissionData = new FormData();

    if (formData.proof) {
      submissionData.append("proof", formData.proof);
    }
    if (bookingData) {
      submissionData.append("name", bookingData.name);
      submissionData.append("phone", bookingData.phone);
      submissionData.append("email", bookingData.email);
      submissionData.append("city", bookingData.city);
      submissionData.append("address", bookingData.address);
      submissionData.append("post_code", bookingData.post_code);
    }

    formData.cosmetic_ids.forEach((item, index) => {
      submissionData.append(`cosmetic_ids[${index}][id]`, String(item.id));
      submissionData.append(
        `cosmetic_ids[${index}][quantity]`,
        String(item.quantity)
      );
    });

    try {
      setLoading(true);
      const response = await apiCLient.post(
        "/booking-transaction",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        console.log("Transaction response data:", response.data.data);
        const bookingTrxId = response.data.data.booking_trx_id;
        const email = response.data.data.email;

        if (!bookingTrxId) {
          console.error("Error: booking_trx_id undefined");
        }
        setSuccessMessage("Payment proof uploaded successfully!");
        localStorage.removeItem("cart");
        localStorage.removeItem("bookingData");
        setFormData({ proof: null, cosmetic_ids: [] });
        setLoading(false);
        navigate(`/booking-finished?trx_id=${bookingTrxId}&email=${email}`);
      } else {
        console.error("unexpected response status:", response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      setLoading(false);
      setFormError([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <p>Loading data...</p>;
  }
  if (error) {
    return <p>Error loading data: {error} </p>;
  }

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col gap-5 bg-[#F6F6F8] pb-[30px]">
        <section id="NavTop">
          <div className="px-5">
            <div className="mt-5 flex w-full flex-col gap-5 rounded-3xl bg-white pb-[44px] pt-3">
              <div className="relative">
                <Link to={`/booking`}>
                  <div className="absolute left-3 top-1/2 flex size-[44px] shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-cosmetics-greylight">
                    <img
                      src="/assets/images/icons/left.svg"
                      alt="icon"
                      className="size-5 shrink-0"
                    />
                  </div>
                </Link>
                <div className="flex flex-col gap-[2px]">
                  <h1 className="text-center text-lg font-bold leading-[27px]">
                    Payment
                  </h1>
                  <p className="text-center text-sm leading-[21px] text-cosmetics-grey">
                    We’ll give best treat
                  </p>
                </div>
              </div>
              <div id="ProgressBar" className="relative px-5">
                <div className="flex">
                  <div className="flex flex-col items-center">
                    <div className="relative z-10 flex h-[25px] items-center">
                      <div className="h-2 w-[60px] rounded-full bg-cosmetics-purple" />
                      <div className="absolute right-0 top-0 translate-x-1/2">
                        <div className="flex flex-col items-center gap-[6px]">
                          <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-cosmetics-purple text-xs font-bold leading-[18px] text-white">
                            1
                          </div>
                          <p className="text-xs font-semibold leading-[18px]">
                            Booking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex h-[25px] w-full items-center">
                    <div className="left-0 h-2 w-1/2 rounded-full bg-cosmetics-purple" />
                    <div className="absolute right-1/2 top-0 translate-x-1/2">
                      <div className="flex flex-col items-center gap-[6px]">
                        <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-cosmetics-purple text-xs font-bold leading-[18px] text-white">
                          2
                        </div>
                        <p className="text-xs font-semibold leading-[18px]">
                          Payment
                        </p>
                      </div>
                    </div>
                    <div className="right-0 h-2 w-1/2 rounded-full bg-[#EDEDF5]" />
                  </div>
                  <div className="relative z-10 flex h-[25px] w-[60px] items-center">
                    <div className="h-2 w-[60px] rounded-full bg-[#EDEDF5]" />
                    <div className="absolute left-0 top-0 -translate-x-1/2">
                      <div className="flex flex-col items-center gap-[6px]">
                        <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#D8D8E4] text-xs font-bold leading-[18px]">
                          3
                        </div>
                        <p className="text-xs font-semibold leading-[18px]">
                          Delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <header>
          <div className="flex flex-col gap-1 px-5">
            <h2 className="text-[26px] font-bold leading-[39px]">
              Make Payment
            </h2>
            <p className="text-cosmetics-grey">
              Data asli harus diberikan amet
            </p>
          </div>
        </header>
        <AccordionSection
          title="Payment Details"
          subtitle="Sebelum bayar cek lagi"
          iconSrc="/assets/images/icons/information.svg"
        >
          <div id="PaymentDetailsJ" className="flex flex-col gap-5">
            <div className="box h-[1px] w-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Total Quantity</p>
              </div>
              <strong className="font-semibold">{totalQuantity} Items</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Sub Total</p>
              </div>
              <strong className="font-semibold">
                {formatCurrency(subtotal)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Discount Code</p>
              </div>
              <strong className="font-semibold">Rp 0</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Delivery Fee</p>
              </div>
              <strong className="font-semibold">Rp 0 (Promo)</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Insurance</p>
              </div>
              <strong className="font-semibold">Included</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Tax 11%</p>
              </div>
              <strong className="font-semibold">{formatCurrency(tax)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <img
                  src="/assets/images/icons/list.svg"
                  alt="icon"
                  className="size-5 shrink-0"
                />
                <p>Grand Total</p>
              </div>
              <strong className="text-[22px] font-bold leading-[33px] text-cosmetics-pink">
                {formatCurrency(total)}
              </strong>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection
          title="Trusted E-Wallets"
          subtitle="Choose lorem dolor active"
          iconSrc="/assets/images/icons/wallet.svg"
        >
          <div id="TrustedEwalletsJ" className="flex flex-col gap-5">
            <div className="box h-[1px] w-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/thumbnails/link-aja.png"
                  alt="image"
                  className="h-[60px] w-[80px] shrink-0"
                />
                <div>
                  <h4 className="font-semibold">LinkAja Pro</h4>
                  <p className="text-sm leading-[21px] text-cosmetics-grey">
                    Offline
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                  Inactive
                </p>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/thumbnails/ovo.png"
                  alt="image"
                  className="h-[60px] w-[80px] shrink-0"
                />
                <div>
                  <h4 className="font-semibold">OVO Inter</h4>
                  <p className="text-sm leading-[21px] text-cosmetics-grey">
                    Offline
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                  Inactive
                </p>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/thumbnails/gopay.png"
                  alt="image"
                  className="h-[60px] w-[80px] shrink-0"
                />
                <div>
                  <h4 className="font-semibold">Link Aja</h4>
                  <p className="text-sm leading-[21px] text-cosmetics-grey">
                    Offline
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F6F6F8] px-[14px] py-2">
                <p className="text-sm font-semibold leading-[21px] text-[#ACACB9]">
                  Inactive
                </p>
              </span>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection
          title="Cash on Delivery"
          subtitle="Choose lorem dolor active"
          iconSrc="/assets/images/icons/cash.svg"
        >
          <div id="CasOnDeliveryJ" className="flex flex-col gap-5">
            <div className="box h-[1px] w-full" />
            <div className="rounded-2xl bg-[#F6F6F8] p-[10px]">
              <p className="text-sm">
                Layanan pembayaran ini belum si amet tersedia karena sedang
                proses dolor.
              </p>
            </div>
          </div>
        </AccordionSection>
        <AccordionSection
          title="Bank Transfer"
          subtitle="Choose lorem dolor active"
          iconSrc="/assets/images/icons/banktf.svg"
        >
          <div id="BankTransferJ" className="flex flex-col gap-5">
            <div className="box h-[1px] w-full" />
            <div className="flex items-start gap-4">
              <img
                src="/assets/images/thumbnails/bca.png"
                alt="image"
                className="h-[60px] w-[81px] shrink-0"
              />
              <div>
                <h4 className="text-sm leading-[21px] text-cosmetics-grey">
                  Bank Central Asia
                </h4>
                <strong className="font-semibold">9893981092</strong>
                <p className="text-sm leading-[21px] text-cosmetics-grey">
                  PT Shayna Beauty
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img
                src="/assets/images/thumbnails/mandiri.png"
                alt="image"
                className="h-[60px] w-[81px] shrink-0"
              />
              <div>
                <h4 className="text-sm leading-[21px] text-cosmetics-grey">
                  Bank Mandiri
                </h4>
                <strong className="font-semibold">193084820912</strong>
                <p className="text-sm leading-[21px] text-cosmetics-grey">
                  PT Shayna Beauty
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>
        <form onClick={handleSubmit} className="flex flex-col gap-5 px-5">
          <section id="PaymentConfirmation">
            <div className="flex flex-col gap-5 rounded-3xl bg-white px-[14px] py-5">
              <div className="flex items-center gap-[10px]">
                <img
                  src="/assets/images/icons/information.svg"
                  alt="icon"
                  className="size-[38px] shrink-0"
                />
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[#0C0422]">
                    Payment Confirmation
                  </h3>
                  <p className="text-sm leading-[21px] text-[#8C8582]">
                    Upload bukti transfer
                  </p>
                </div>
              </div>
              <div className="box h-[1px] w-full" />
              <label className="flex flex-col gap-[6px]">
                <h4 className="font-semibold text-[#030504]">
                  Proof of Payment
                </h4>
                <div className="group relative flex h-[54px] items-center justify-center rounded-full bg-[#E0E0EC] transition-all duration-300 focus-within:bg-cosmetics-gradient-purple-pink">
                  <div className="h-[calc(100%_-_2px)] w-[calc(100%_-_2px)] rounded-full bg-[#F6F6F8] transition-all duration-300 focus-within:h-[calc(100%_-_4px)] focus-within:w-[calc(100%_-_4px)]">
                    <p
                      id="upload"
                      className="absolute left-[57px] top-1/2 -translate-y-1/2 py-[15px] text-[#ACACB9]"
                    >
                      {fileName ? fileName : "Add an attachment"}
                    </p>
                    <input
                      type="file"
                      name="proof"
                      onChange={handleChange}
                      id="file-upload"
                      className="absolute top-1/2 w-full -translate-y-1/2 rounded-full py-[15px] pl-[57px] pr-[13px] font-semibold text-[#030504] opacity-0 file:hidden focus:outline-none"
                    />
                    <div className="absolute left-[14px] top-1/2 flex w-[35px] -translate-y-1/2 justify-between">
                      <img
                        src="/assets/images/icons/list.svg"
                        alt="icon"
                        className="size-[24px] shrink-0"
                      />
                      <span className="h-[26px] w-px bg-[#E0E0EC] transition-all duration-300 group-focus-within:bg-cosmetics-gradient-purple-pink" />
                    </div>
                  </div>
                </div>
                {formError.find((error) => error.path.includes("proof")) && (
                  <p className="text-sm leading-[21px] text-[#E70011]">
                    {
                      formError.find((error) => error.path.includes("proof"))
                        ?.message
                    }
                  </p>
                )}
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-between rounded-full bg-cosmetics-gradient-pink-white px-5 py-[14px] transition-all duration-300 hover:shadow-[0px_6px_22px_0px_#FF4D9E82]"
              >
                <strong className="font-semibold text-white">
                  {loading ? "Submitting..." : "Confirm My Payment"}
                </strong>
                <img
                  src="/assets/images/icons/right.svg"
                  alt="icon"
                  className="size-[24px] shrink-0"
                />
              </button>
            </div>
          </section>
        </form>
      </main>
    </>
  );
}

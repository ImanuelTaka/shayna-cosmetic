interface Benefit{
    id:number,
    name:string,
}

interface Photo{
    id:number,
    photo:string,
}

interface Testimonial{
    id:number,
    rating:string,
    name:string,
    photo:string,
    message:string,
}

export interface Cosmetic{
    id:number,
    price:number,
    duration:number,
    name:string,
    slug:string,
    is_popular:boolean,
    category: Category,
    brand: Brand
    thumbnail:string,
    benefits: Benefit[],
    photos: Photo[],
    testimonials: Testimonial[],
    about: string,
}

export interface Category{
    id:number,
    name:string,
    slug:string,
    photo:string,
    cosmetics_count: number,
    cosmetics: Cosmetic[],
    popular_cosmetics: Cosmetic[],
}

export interface Brand{
    id:number,
    name:string,
    slug:string,
    photo:string,
    cosmetic_count: number,
    Cosmetics: Cosmetic[],
    popular_cosmetics: Cosmetic[],
}

export interface BookingDetails{
    id: string,
    name: string,
    phone: string,
    email: string,
    proof: string | null,
    address: string,
    post_code: string,
    city: string,
    booking_trx_id: string,
    quantity: number,
    is_paid: boolean,
    sub_total_amount: number,
    total_tax_amount: number,
    total_amount: number,
    transaction_details: TransactionDetails[],
}

interface TransactionDetails{
    id: string,
    price: number,
    cosmetic_id: number,
    quantity: number,
    cosmetic: Cosmetic,
}

export interface CartItem{
    cosmetic_id: number,
    slug: string,
    quantity: number,
}

export interface BookingFormData{
    name: string,
    email: string,
    phone: string,
    post_code: string,
    address: string,
    city: string,
}
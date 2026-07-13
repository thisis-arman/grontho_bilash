const ContactUs = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">Contact Us</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">Get in Touch</h1>
            </div>

            <div>
                <p className="text-text text-sm md:text-base leading-relaxed">
                    If you have any questions or concerns, please feel free to contact us through any of the methods below.
                </p>
            </div>

            <div>
                <h2 className="text-xl md:text-2xl font-bold text-heading mb-4">Email</h2>
                <p className="text-text text-sm md:text-base leading-relaxed">
                    [EMAIL_ADDRESS]
                </p>
            </div>

            <div>
                <h2 className="text-xl md:text-2xl font-bold text-heading mb-4">Phone</h2>
                <p className="text-text text-sm md:text-base leading-relaxed">
                    +8801883350118
                </p>
            </div>

            <div>
                <h2 className="text-xl md:text-2xl font-bold text-heading mb-4">Address</h2>
                <p className="text-text text-sm md:text-base leading-relaxed">
                    123 Book Street, Literature City, Dhaka, Bangladesh
                </p>
            </div>
        </div>
    );
}

export default ContactUs;
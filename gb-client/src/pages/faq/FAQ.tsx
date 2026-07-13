const faqs = [
    {
        id: 1,
        question: "What is Grontho Bilash?",
        answer: "Grontho Bilash is an online platform where you can buy and sell used and new books. It connects book lovers with readers looking for great books at affordable prices."
    },
    {
        id: 2,
        question: "How do I create an account?",
        answer: "Creating an account is simple. Just click on the 'Sign Up' button, fill in your details, and you'll be ready to explore books in minutes."
    },
    {
        id: 3,
        question: "Can I sell my own books on Grontho Bilash?",
        answer: "Yes! Sellers can easily list their books with details and photos. Once a buyer purchases the book, we handle the payment and guide you through the delivery process."
    },
    {
        id: 4,
        question: "What payment methods do you accept?",
        answer: "We accept all major payment methods including credit/debit cards, mobile banking, and COD (Cash on Delivery) for eligible orders."
    },
    {
        id: 5,
        question: "Do you offer refunds or returns?",
        answer: "Yes, we have a 7-day return policy for books that are not as described. Please read our full refund policy for detailed information."
    },
    {
        id: 6,
        question: "Are the books sold on the platform new or used?",
        answer: "We offer both new and used books. Each listing specifies whether the book is new or used, along with its condition details."
    }
];
const FAQ = () => {
    return (
        <div className="py-16 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <p className="text-primary text-sm md:text-base font-semibold mb-3 tracking-wide uppercase">Frequently Asked Questions</p>
                <h1 className="text-3xl md:text-5xl font-bold text-heading">Answers to Your Questions</h1>
            </div>

            <div className="space-y-6">
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="border border-border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <h3 className="text-lg md:text-xl font-semibold text-heading mb-3">{faq.question}</h3>
                        <p className="text-text text-sm md:text-base leading-relaxed">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
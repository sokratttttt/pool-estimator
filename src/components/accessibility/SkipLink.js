/**
 * Skip to main content link for keyboard navigation
 */
export default function SkipLink() {
    return (
        <a
            href="#main-content"
            className="fixed top-0 left-0 z-[9999] p-4 bg-cyan-500 text-white font-medium rounded-br-lg transform -translate-y-full focus:translate-y-0 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2"
        >
            Перейти к основному содержимому
        </a>
    );
}

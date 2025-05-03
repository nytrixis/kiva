export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff9f9] flex flex-col items-center justify-center p-6">
      {/* Logo Heading */}
      <h1 className="font-heading text-5xl md:text-6xl text-[#2a3c5b] mb-4">
        Kiva
      </h1>

      {/* Tagline */}
      <p className="font-sans text-lg md:text-xl text-[#6c5a7c] mb-8">
        Be your own brand.
      </p>

      {/* Button to test hover etc */}
      <button className="font-sans px-6 py-3 bg-[#2a3c5b] text-white rounded-full hover:bg-[#1c293f] transition">
        Shop Now
      </button>
    </main>
  );
}

const FAVORITE_POSTERS = [
  { title: "When Harry Met Sally", posterUrl: "https://m.media-amazon.com/images/M/MV5BMjE0ODEwNjM2MF5BMl5BanBnXkFtZTcwMjU2Mzg3NA@@._V1_.jpg" },
  { title: "Notting Hill", posterUrl: "https://m.media-amazon.com/images/M/MV5BMjc0MzAzNDg5MF5BMl5BanBnXkFtZTgwMjIxNzk5NzE@._V1_.jpg" },
  { title: "10 Things I Hate About You", posterUrl: "https://m.media-amazon.com/images/M/MV5BMmExYWJjNTktZGU3Yy00MTY5LWEzNjItYjdlNGYzODk2OWMxXkEyXkFqcGc@._V1_.jpg" },
  { title: "Crazy Rich Asians", posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYxNDMyOTAxN15BMl5BanBnXkFtZTgwMDg1ODYzNTM@._V1_.jpg" },
  { title: "The Proposal", posterUrl: "https://m.media-amazon.com/images/M/MV5BOGQ5MWE0YjAtNTRiMi00N2Q3LWI5ZjAtYWVjOGQ3NTcyMjYzXkEyXkFqcGc@._V1_.jpg" },
  { title: "Pretty Woman", posterUrl: "https://m.media-amazon.com/images/M/MV5BNjk2ODQzNDYxNV5BMl5BanBnXkFtZTgwOTU3NTczMTE@._V1_.jpg" },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-damion text-4xl text-brand mb-3">Rom Com Sundays</h1>
        <p className="text-text-secondary leading-relaxed">
          Every Sunday, a rom-com. Every Monday, a rating. This is the collection.
        </p>
      </div>

      {/* Favorite movies mosaic */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-10">
        {FAVORITE_POSTERS.map((movie) => (
          <div
            key={movie.title}
            className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 relative group"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-text-secondary text-sm mb-6">
          Have one I should watch?{" "}
          <a href="/suggest" className="text-brand font-medium hover:underline">
            Suggest it
          </a>
        </p>
        <a
          href="https://instagram.com/romcomsundays"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 transition-colors"
        >
          Follow @romcomsundays
        </a>
      </div>
    </div>
  );
}

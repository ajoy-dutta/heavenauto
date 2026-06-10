import Hero from '../components/Hero';

const Home = () => {
  return (
    <main>
      <Hero />
      {/* You can add more sections here later like Categories, Featured Products, etc. */}
      <div className="py-20 px-12 text-center text-gray-400">
        <h2>More content goes here (Features, Products, Footer)</h2>
      </div>
    </main>
  );
};

export default Home;
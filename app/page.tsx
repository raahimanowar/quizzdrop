export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="bg-black px-4 py-2 rounded-lg">
          <span className="text-lg font-medium">QuizzDrop</span>
        </div>
        <div className="bg-black px-4 py-2 rounded-lg">
          <span className="text-lg font-medium">github</span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-12">
            Turn your pdfs into a quiz
          </h1>
          <div className="border-2 border-gray-300 border-dashed rounded-xl p-16 bg-white hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-gray-500 text-lg">
              + Drop box
            </div>
          </div>
          <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Generate Quiz
          </button>
        </div>
      </main>
    </div>
  );
}

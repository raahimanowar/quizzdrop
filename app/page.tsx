export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-purple-100 p-4">
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="bg-white text-gray-900 px-6 py-3 rounded-2xl shadow-lg border border-gray-100">
          <span className="text-xl font-bold">QuizzDrop</span>
        </div>
        <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <span className="text-lg font-medium">GitHub</span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="max-w-3xl w-full text-center space-y-12">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Turn your PDFs into a quiz
          </h1>
          
          <div className="bg-white border-2 border-purple-200 border-dashed rounded-3xl p-20 hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer shadow-lg">
            <div className="text-purple-600 text-xl font-medium">
              + Drop your PDF here
            </div>
            <div className="text-gray-500 text-sm mt-2">
              or click to browse files
            </div>
          </div>

          <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Generate Quiz
          </button>
        </div>
      </main>
    </div>
  );
}

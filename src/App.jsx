import { useState, useEffect } from 'react';
import './App.css';
import { InputBox } from './components';
import useCurrencyInfo from './hooks/useCurrencyInfo';

function App() {
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("inr");
  const [tos, setTos] = useState(["usd"]);
  const [convertedAmounts, setConvertedAmounts] = useState([0]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const currencyInfo = useCurrencyInfo(from);
  const options = Object.keys(currencyInfo);

  useEffect(() => {
    loadFavorites();
    loadHistory();
  }, []);

  const swap = () => {
    setFrom(tos[0]);
    setTos([from, ...tos.slice(1)]);
    setConvertedAmounts([amount, ...convertedAmounts.slice(1)]);
    setAmount(convertedAmounts[0]);
  };

  const convert = () => {
    const amounts = tos.map(to => amount * currencyInfo[to]);
    setConvertedAmounts(amounts);
    saveHistory(amounts);
  };

  const addCurrency = () => {
    setTos([...tos, "eur"]);
    setConvertedAmounts([...convertedAmounts, 0]);
  };

  const removeCurrency = (index) => {
    setTos(tos.filter((_, i) => i !== index));
    setConvertedAmounts(convertedAmounts.filter((_, i) => i !== index));
  };

  const toggleFavorite = (pair) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(pair)) {
      updatedFavorites = updatedFavorites.filter(fav => fav !== pair);
    } else {
      updatedFavorites.push(pair);
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const saveHistory = (amounts) => {
    const newHistory = [...history, { from, tos, amounts, date: new Date() }];
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  };

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  };

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(savedHistory);
  };

  const getConvertButtonText = () => {
    return tos.length > 1
      ? `Convert ${from.toUpperCase()} to Multiple Currencies`
      : `Convert ${from.toUpperCase()} to ${tos[0].toUpperCase()}`;
  };

  return (
    <div
      className="w-full h-screen flex flex-col justify-between bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/1629172/pexels-photo-1629172.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
      }}
    >
      <header className="w-full p-6 bg-gradient-to-r from-blue-800 to-purple-900 text-white text-center text-4xl font-extrabold shadow-lg">
        Currency Converter
      </header>

      <div className="flex-grow flex justify-center items-start p-6">
        <div className="flex w-full max-w-6xl gap-6">
          <div className="flex flex-col flex-1 border border-gray-300 rounded-xl p-8 backdrop-blur-sm bg-white/60 shadow-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                convert();
              }}
            >
              <div className="w-full mb-6">
                <InputBox
                  label="From"
                  amount={amount}
                  currencyOptions={options}
                  onCurrencyChange={(currency) => setFrom(currency)}
                  selectCurrency={from}
                  onAmountChange={(amount) => setAmount(amount)}
                />
              </div>
              <div className="relative w-full h-0.5 mb-6">
                <button
                  type="button"
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-blue-600 text-white px-6 py-2 shadow-lg hover:bg-blue-700 transition transform hover:scale-110"
                  onClick={swap}
                >
                  Swap
                </button>
              </div>
              {tos.map((to, index) => (
                <div key={index} className="w-full mb-6 flex items-center">
                  <InputBox
                    label="To"
                    amount={convertedAmounts[index]}
                    currencyOptions={options}
                    onCurrencyChange={(currency) => {
                      const newTos = [...tos];
                      newTos[index] = currency;
                      setTos(newTos);
                    }}
                    selectCurrency={to}
                    amountDisable
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="ml-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition"
                      onClick={() => removeCurrency(index)}
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    className={`ml-4 ${
                      favorites.includes(`${from}_${to}`)
                        ? 'bg-yellow-500'
                        : 'bg-gray-300'
                    } text-white px-4 py-2 rounded-full shadow-lg hover:bg-yellow-600 transition`}
                    onClick={() => toggleFavorite(`${from}_${to}`)}
                  >
                    {favorites.includes(`${from}_${to}`)
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-green-700 transition mb-6"
                onClick={addCurrency}
              >
                Add Another Currency
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                {getConvertButtonText()}
              </button>
            </form>
          </div>

          <div className="flex flex-col flex-1 border border-gray-300 rounded-xl p-8 backdrop-blur-sm bg-white/60 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Favorite Currencies</h2>
            {favorites.map((fav, index) => (
              <div key={index} className="flex justify-between items-center mb-4">
                <span>{fav}</span>
                <button
                  className="text-red-600"
                  onClick={() => toggleFavorite(fav)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col flex-1 border border-gray-300 rounded-xl p-8 backdrop-blur-sm bg-white/60 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
            {history.map((entry, index) => (
              <div key={index} className="mb-4">
                <p>
                  <strong>Date:</strong> {new Date(entry.date).toLocaleString()}
                </p>
                <p>
                  <strong>From:</strong> {entry.from.toUpperCase()}
                </p>
                {entry.tos.map((to, idx) => (
                  <p key={idx}>
                    <strong>To:</strong> {to.toUpperCase()} - {entry.amounts[idx]}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="w-full p-4 bg-gradient-to-r from-blue-800 to-purple-900 text-white text-center text-sm font-medium shadow-lg">
        Made with ♥ by{' '}
        <a
          href="https://github.com/adityasingh151"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Aditya
        </a>
      </footer>
    </div>
  );
}

export default App;

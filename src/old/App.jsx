import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Users, ChefHat, Menu, Calendar, ShoppingCart, TrendingUp, Flame, Heart, ArrowRight, Info, Plus } from 'lucide-react';

// ==================== API CONFIG ====================
const API_KEY = '537773655114493d97a84f32018e3d08'; // ← Spoonacular API key
const API_BASE = 'https://api.spoonacular.com';

const api = {
  async searchRecipes(query) {
    try {
      const response = await fetch(`${API_BASE}/recipes/complexSearch?query=${query}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search Error:', error);
      return [];
    }
  },

  async getRecipeDetails(id) {
    try {
      const response = await fetch(`${API_BASE}/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.error('Details Error:', error);
      return null;
    }
  },

  async getFeatured() {
    try {
      const response = await fetch(`${API_BASE}/recipes/random?number=6&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Featured Error:', error);
      return [];
    }
  }
};

const SUBSTITUTIONS = {
  'butter': ['olive oil', 'coconut oil', 'ghee'],
  'milk': ['almond milk', 'oat milk', 'coconut milk'],
  'eggs': ['flax eggs', 'chia seeds', 'applesauce'],
  'flour': ['almond flour', 'rice flour', 'coconut flour'],
  'sugar': ['honey', 'maple syrup', 'stevia']
};

// ==================== SIDEBAR ====================
const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', icon: Search, label: 'Discover Recipes' },
    { id: 'pantry', icon: ShoppingCart, label: 'My Pantry' },
    { id: 'planner', icon: Calendar, label: 'Meal Planner' },
    { id: 'nutrition', icon: TrendingUp, label: 'Nutrition Tracker' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Suurchef</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-800 font-semibold mb-2">💡 Quick Tip</p>
            <p className="text-xs text-green-700">Search for any meal to get detailed recipes with step-by-step instructions!</p>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== HERO SECTION ====================
const Hero = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleClick = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <ChefHat className="w-5 h-5" />
            <span className="text-sm font-semibold">Your Personal Culinary Assistant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Discover Amazing
            <span className="block text-yellow-300">Recipes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-green-50 mb-12 leading-relaxed">
            Search for any meal and get detailed step-by-step cooking instructions
          </p>

          <div className="relative max-w-2xl mx-auto mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleClick()}
              placeholder="Search for pasta, pizza, curry, salad..."
              className="w-full px-8 py-5 pr-32 text-lg text-gray-800 bg-white rounded-2xl shadow-2xl outline-none placeholder-gray-400"
            />
            <button
              onClick={handleClick}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden md:inline">Search</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['Pasta', 'Pizza', 'Curry', 'Salad', 'Soup', 'Dessert'].map(tag => (
              <button
                key={tag}
                onClick={() => onSearch(tag)}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold hover:bg-opacity-30 transition-all backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== RECIPE CARD ====================
const RecipeCard = ({ recipe, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
  >
    <div className="relative h-56 bg-gray-200">
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ChefHat className="w-20 h-20 text-gray-400" />
        </div>
      )}
      
      <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <Clock className="w-3 h-3 text-green-600" />
        <span className="text-xs font-bold text-gray-800">{recipe.readyInMinutes || 30}m</span>
      </div>

      {recipe.vegan && (
        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          🌱 Vegan
        </div>
      )}
    </div>

    <div className="p-5">
      <h3 className="font-bold text-lg mb-3 text-gray-800 line-clamp-2">
        {recipe.title}
      </h3>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" />
          <span>{recipe.servings || 4} servings</span>
        </div>
        
        {recipe.healthScore && (
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-green-600">{recipe.healthScore}%</span>
          </div>
        )}
      </div>

      <div className="flex items-center text-green-600 font-semibold">
        <span>View Recipe</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  </div>
);

// ==================== RECIPE MODAL ====================
const RecipeModal = ({ recipe, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await api.getRecipeDetails(recipe.id);
      setDetails(data);
      setLoading(false);
    };
    load();
  }, [recipe.id]);

  const getSubs = (name) => {
    const lower = name.toLowerCase();
    for (const [key, subs] of Object.entries(SUBSTITUTIONS)) {
      if (lower.includes(key)) return subs;
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white bg-opacity-95 border-b z-10 backdrop-blur">
          <div className="p-6 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{recipe.title}</h2>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  {details?.readyInMinutes || 30} min
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                  <Users className="w-4 h-4" />
                  {details?.servings || 4} servings
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        ) : (
          <div className="p-8">
            {details?.image && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
                <img src={details.image} alt={details.title} className="w-full h-80 object-cover" />
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                Ingredients
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {details?.extendedIngredients?.map((ing, idx) => {
                  const subs = getSubs(ing.name);
                  return (
                    <label key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.includes(idx)}
                        onChange={() => setCheckedIngredients(prev =>
                          prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                        )}
                        className="mt-1 w-5 h-5 text-green-600 rounded"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${checkedIngredients.includes(idx) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {ing.amount} {ing.unit} {ing.name}
                        </p>
                        {subs.length > 0 && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Subs: {subs.join(', ')}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-blue-600" />
                </div>
                Instructions
              </h3>

              <div className="space-y-4">
                {details?.analyzedInstructions?.[0]?.steps?.map((step) => (
                  <label key={step.number} className="flex gap-4 p-5 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-green-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedSteps.includes(step.number)}
                      onChange={() => setCheckedSteps(prev =>
                        prev.includes(step.number) ? prev.filter(i => i !== step.number) : [...prev, step.number]
                      )}
                      className="mt-1 w-5 h-5 text-green-600 rounded"
                    />
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg flex-shrink-0">
                      {step.number}
                    </div>
                    <p className={`flex-1 text-gray-700 leading-relaxed ${checkedSteps.includes(step.number) ? 'line-through text-gray-400' : ''}`}>
                      {step.step}
                    </p>
                  </label>
                )) || <p className="text-center text-gray-500 py-8">No instructions available</p>}
              </div>
            </div>

            {details?.nutrition && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Nutrition (per serving)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {details.nutrition.nutrients?.slice(0, 8).map((n) => (
                    <div key={n.name} className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-3xl font-bold text-green-700 mb-1">
                        {Math.round(n.amount)}
                        <span className="text-lg">{n.unit}</span>
                      </p>
                      <p className="text-sm text-gray-600 font-semibold">{n.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== FEATURED SECTION ====================
const FeaturedSection = ({ recipes, onSelect, loading }) => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Popular Recipes</h2>
        <p className="text-xl text-gray-600">Trending dishes loved by home chefs worldwide</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => onSelect(r)} />)}
        </div>
      )}
    </div>
  </div>
);

// ==================== SEARCH RESULTS ====================
const SearchResults = ({ recipes, query, onSelect, loading }) => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {loading ? 'Searching...' : `Results for "${query}"`}
        </h2>
        <p className="text-gray-600">{recipes.length} recipes found</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => onSelect(r)} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl text-gray-600">No recipes found. Try different keywords!</p>
        </div>
      )}
    </div>
  </div>
);

// ==================== OTHER VIEWS ====================
const PantryView = () => {
  const [items, setItems] = useState(['chicken', 'rice', 'tomato']);
  const [input, setInput] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          My Pantry
        </h2>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                setItems([...items, input.trim()]);
                setInput('');
              }
            }}
            placeholder="Add ingredient..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-green-500"
          />
          <button
            onClick={() => {
              if (input.trim()) {
                setItems([...items, input.trim()]);
                setInput('');
              }
            }}
            className="px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2 font-semibold">
              {item}
              <button onClick={() => setItems(items.filter(i => i !== item))}>
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlannerView = () => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Calendar className="w-8 h-8 text-blue-600" />
        Weekly Meal Plan
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
          <div key={day} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300">
            <h3 className="font-bold text-lg mb-3 text-blue-600">{day}</h3>
            <p className="text-gray-400 text-sm">No meals planned</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NutritionView = () => {
  const data = { goal: 2000, consumed: 1450 };
  const pct = (data.consumed / data.goal) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-purple-600" />
          Nutrition Tracker
        </h2>
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-5xl font-bold text-green-700">{data.consumed}</p>
              <p className="text-gray-600">calories consumed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold">{data.goal - data.consumed}</p>
              <p className="text-gray-600">remaining</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
          <p className="text-sm text-amber-800">⚠️ Mock data - Backend integration pending</p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [featured, setFeatured] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const load = async () => {
      const recipes = await api.getFeatured();
      setFeatured(recipes);
      setLoadingFeatured(false);
    };
    load();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoadingSearch(true);
    const results = await api.searchRecipes(query);
    setSearchResults(results);
    setLoadingSearch(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Suurchef
            </h1>
          </div>

          <div className="w-10" />
        </div>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {activeView === 'home' && (
        <>
          <Hero onSearch={handleSearch} loading={loadingSearch} />
          {searchQuery ? (
            <SearchResults recipes={searchResults} query={searchQuery} onSelect={setSelectedRecipe} loading={loadingSearch} />
          ) : (
            <FeaturedSection recipes={featured} onSelect={setSelectedRecipe} loading={loadingFeatured} />
          )}
        </>
      )}

      {activeView === 'pantry' && <PantryView />}
      {activeView === 'planner' && <PlannerView />}
      {activeView === 'nutrition' && <NutritionView />}

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </div>
  );
}
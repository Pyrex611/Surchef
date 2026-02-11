import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Users, ChefHat, Menu, Calendar, ShoppingCart, TrendingUp, Flame, Heart, ArrowRight, Info, Plus, LogOut } from 'lucide-react';

// ==================== API CONFIG ====================
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '537773655114493d97a84f32018e3d08';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.spoonacular.com';

const api = {
  async searchRecipes(query) {
    try {
      const response = await fetch(
        `${API_BASE}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`
      );
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
      const response = await fetch(
        `${API_BASE}/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`
      );
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.error('Details Error:', error);
      return null;
    }
  },

  async getFeatured() {
    try {
      const response = await fetch(
        `${API_BASE}/recipes/random?number=6&apiKey=${API_KEY}`
      );
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
const Sidebar = ({ isOpen, onClose, activeView, setActiveView, user, onLogout }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', icon: Search, label: 'Discover Recipes' },
    { id: 'pantry', icon: ShoppingCart, label: 'My Pantry' },
    { id: 'planner', icon: Calendar, label: 'Meal Planner' },
    { id: 'nutrition', icon: TrendingUp, label: 'Nutrition Tracker' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">SurChef</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

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

          <button
            onClick={onLogout}
            className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleClick();
  };

  return (
    <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <ChefHat className="w-5 h-5" />
            <span className="text-sm font-semibold">Your Personal Culinary Assistant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Discover Amazing
            <span className="block text-yellow-300 mt-2">Recipes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-green-50 mb-12 leading-relaxed">
            Search for any meal and get detailed step-by-step cooking instructions
          </p>

          <div className="relative max-w-2xl mx-auto mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for pasta, pizza, curry, salad..."
              className="w-full px-8 py-5 pr-32 text-lg text-gray-800 bg-white rounded-2xl shadow-2xl outline-none placeholder-gray-400 focus:ring-4 focus:ring-yellow-300 transition-all"
            />
            <button
              onClick={handleClick}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
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
                disabled={loading}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold hover:bg-opacity-30 transition-all backdrop-blur-sm disabled:opacity-50"
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
    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
  >
    <div className="relative h-56 bg-gray-200 overflow-hidden">
      {recipe.image ? (
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
          <ChefHat className="w-20 h-20 text-green-400" />
        </div>
      )}
      
      <div className="absolute top-3 right-3 bg-white bg-opacity-95 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <Clock className="w-3 h-3 text-green-600" />
        <span className="text-xs font-bold text-gray-800">{recipe.readyInMinutes || 30}m</span>
      </div>
      
      {recipe.vegan && (
        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          🌱 Vegan
        </div>
      )}
    </div>
    
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
        {recipe.title}
      </h3>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {recipe.servings && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        )}
        
        {recipe.healthScore && (
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span>{recipe.healthScore}% healthy</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ==================== RECIPE MODAL ====================
const RecipeModal = ({ recipe, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('instructions');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getRecipeDetails(recipe.id);
      setDetails(data);
      setLoading(false);
    };
    load();
  }, [recipe.id]);

  const tabs = [
    { id: 'instructions', label: 'Instructions', icon: ChefHat },
    { id: 'ingredients', label: 'Ingredients', icon: ShoppingCart },
    { id: 'nutrition', label: 'Nutrition', icon: TrendingUp }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="relative h-64 bg-gray-200">
          {recipe.image && (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4">{recipe.title}</h2>
          
          <div className="flex gap-4 mb-6 flex-wrap">
            {recipe.readyInMinutes && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">{recipe.readyInMinutes} minutes</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">{recipe.servings} servings</span>
              </div>
            )}
            {recipe.healthScore && (
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">{recipe.healthScore}% healthy</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : details ? (
              <>
                {activeTab === 'instructions' && (
                  <div className="space-y-4">
                    {details.analyzedInstructions?.[0]?.steps?.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {step.number}
                        </div>
                        <p className="text-gray-700 pt-1">{step.step}</p>
                      </div>
                    )) || <p className="text-gray-600">No instructions available.</p>}
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.extendedIngredients?.map((ing, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-gray-800 font-medium">{ing.original}</span>
                      </div>
                    )) || <p className="text-gray-600">No ingredients available.</p>}
                  </div>
                )}

                {activeTab === 'nutrition' && details.nutrition && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {details.nutrition.nutrients?.slice(0, 8).map((nutrient, i) => (
                        <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">{nutrient.name}</p>
                          <p className="text-xl font-bold text-green-700">
                            {Math.round(nutrient.amount)}{nutrient.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-600 py-12">Failed to load details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== FEATURED SECTION ====================
const FeaturedSection = ({ recipes, onSelect, loading }) => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="mb-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
        <Flame className="w-10 h-10 text-orange-500" />
        Featured Recipes
      </h2>
      <p className="text-gray-600 text-lg">Discover our handpicked recipes for you</p>
    </div>
    
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="h-56 bg-gray-200 shimmer" />
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded shimmer" />
              <div className="h-4 bg-gray-200 rounded w-3/4 shimmer" />
            </div>
          </div>
        ))}
      </div>
    ) : recipes.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => onSelect(r)} />)}
      </div>
    ) : (
      <div className="text-center py-20">
        <ChefHat className="w-20 h-20 text-gray-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600">No featured recipes available.</p>
      </div>
    )}
  </div>
);

// ==================== SEARCH RESULTS ====================
const SearchResults = ({ recipes, query, onSelect, loading }) => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="mb-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-3">
        Search Results for "{query}"
      </h2>
      <p className="text-gray-600 text-lg">Found {recipes.length} recipes</p>
    </div>
    
    <div className="max-w-7xl mx-auto">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="h-56 bg-gray-200 shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded shimmer" />
                <div className="h-4 bg-gray-200 rounded w-3/4 shimmer" />
              </div>
            </div>
          ))}
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
          <p className="text-xl text-gray-600 mb-2">No recipes found</p>
          <p className="text-gray-500">Try different keywords or browse our featured recipes</p>
        </div>
      )}
    </div>
  </div>
);

// ==================== OTHER VIEWS ====================
const PantryView = () => {
  const [items, setItems] = useState(['chicken', 'rice', 'tomato', 'onion', 'garlic']);
  const [input, setInput] = useState('');

  const addItem = () => {
    if (input.trim() && !items.includes(input.trim().toLowerCase())) {
      setItems([...items, input.trim().toLowerCase()]);
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          My Pantry
        </h2>
        <p className="text-gray-600 mb-6">Track the ingredients you have at home</p>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add ingredient..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-green-500 transition-colors"
          />
          <button
            onClick={addItem}
            className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2 font-semibold">
              {item}
              <button 
                onClick={() => setItems(items.filter(i => i !== item))}
                className="hover:bg-green-200 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-8">No ingredients added yet</p>
        )}
      </div>
    </div>
  );
};

const PlannerView = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Weekly Meal Plan
        </h2>
        <p className="text-gray-600 mb-8">Plan your meals for the week ahead</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map(day => (
            <div key={day} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <h3 className="font-bold text-lg mb-3 text-blue-600">{day}</h3>
              <div className="space-y-2">
                <div className="text-gray-400 text-sm italic">No meals planned</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
        <p className="text-gray-600 mb-8">Monitor your daily calorie intake</p>
        
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-5xl font-bold text-green-700">{data.consumed}</p>
              <p className="text-gray-600">calories consumed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-gray-700">{data.goal - data.consumed}</p>
              <p className="text-gray-600">remaining</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0</span>
            <span>{data.goal} cal goal</span>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
          <p className="text-sm text-amber-800 font-semibold">⚠️ Demo Data</p>
          <p className="text-xs text-amber-700 mt-1">Backend integration required for live tracking</p>
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for logged-in user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    } else {
      // Redirect to login if not authenticated
      window.location.href = 'login.html';
    }

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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              SurChef
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user.username[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
      />

      {activeView === 'home' && (
        <>
          <Hero onSearch={handleSearch} loading={loadingSearch} />
          {searchQuery ? (
            <SearchResults 
              recipes={searchResults} 
              query={searchQuery} 
              onSelect={setSelectedRecipe} 
              loading={loadingSearch} 
            />
          ) : (
            <FeaturedSection 
              recipes={featured} 
              onSelect={setSelectedRecipe} 
              loading={loadingFeatured} 
            />
          )}
        </>
      )}

      {activeView === 'pantry' && <PantryView />}
      {activeView === 'planner' && <PlannerView />}
      {activeView === 'nutrition' && <NutritionView />}

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChefHat,
  Clock,
  Flame,
  Heart,
  Info,
  LogOut,
  Menu,
  Plus,
  Search,
  ShoppingBasket,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { authService, backendMeta, dataService, recipeApi } from './lib/backend';

const views = [
  { id: 'home', label: 'Discover', icon: Search },
  { id: 'pantry', label: 'Pantry', icon: ShoppingBasket },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'nutrition', label: 'Nutrition', icon: TrendingUp }
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getDayKey = (value) => value.toLowerCase();

const Logo = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center">
      <ChefHat className="h-5 w-5" />
    </div>
    {!compact && (
      <div>
        <p className="text-lg font-extrabold tracking-tight text-gray-900">SurChef</p>
        <p className="text-xs text-gray-500 -mt-0.5">Smart meal command center</p>
      </div>
    )}
  </div>
);

const AuthPanel = ({ onAuth }) => {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const user = isSignUp ? await authService.signUp(form) : await authService.signIn(form);
      onAuth(user);
    } catch (err) {
      setError(err?.message || 'Unable to authenticate. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-teal-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-8">
        <div className="mb-8">
          <Logo />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="text-sm text-gray-500 mt-1">Store meal plans, pantry items, and nutrition progress across sessions.</p>

        <form onSubmit={submit} className="space-y-4 mt-6">
          {isSignUp && (
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Username</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.username}
                required
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Chef name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.email}
              required
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.password}
              required
              minLength={6}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-2.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
            setError('');
          }}
          className="mt-4 text-sm text-emerald-700 font-semibold"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>

        <p className="text-xs text-gray-500 mt-6">Data mode: {backendMeta.providerLabel}</p>
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onClick }) => (
  <button
    onClick={onClick}
    className="text-left bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5"
  >
    <div className="h-48 bg-gray-100 overflow-hidden">
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center"><ChefHat className="w-10 h-10 text-emerald-400" /></div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-800 line-clamp-2">{recipe.title}</h3>
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.readyInMinutes || 30} min</span>
        <span className="inline-flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.healthScore || 70}</span>
      </div>
    </div>
  </button>
);

const RecipeModal = ({ recipe, onClose }) => {
  const [details, setDetails] = useState(recipe);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const next = await recipeApi.getRecipeDetails(recipe.id);
      if (mounted && next) setDetails(next);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [recipe.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-64 bg-gray-100">
          {details.image && <img src={details.image} alt={details.title} className="w-full h-full object-cover" />}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/90"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{details.title}</h2>
          <p className="text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: details.summary || '' }} />

          {details.analyzedInstructions?.[0]?.steps?.length > 0 && (
            <div className="mt-5">
              <p className="font-semibold text-gray-900 mb-2">Steps</p>
              <ol className="space-y-2">
                {details.analyzedInstructions[0].steps.slice(0, 8).map((step) => (
                  <li key={step.number} className="text-sm text-gray-700 flex gap-2">
                    <span className="font-bold text-emerald-600">{step.number}.</span>
                    <span>{step.step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DesktopSidebar = ({ open, setOpen, activeView, setActiveView, onLogout, user }) => (
  <>
    {open && <div className="hidden md:block fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}
    <aside className={`hidden md:flex fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-50 flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-5 border-b border-gray-100">
        <Logo />
      </div>
      <div className="p-5 space-y-2 flex-1">
        {views.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              setOpen(false);
            }}
            className={`w-full rounded-xl px-4 py-3 font-semibold flex items-center gap-3 ${activeView === item.id ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-5 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500 text-white grid place-items-center"><User className="w-4 h-4" /></div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{user.username}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full rounded-xl border border-red-200 text-red-600 font-semibold py-2.5 flex items-center justify-center gap-2 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  </>
);

const MobileFooterNav = ({ activeView, setActiveView }) => (
  <footer className="fixed bottom-0 left-0 right-0 md:hidden border-t border-gray-200 bg-white/95 backdrop-blur z-40">
    <div className="grid grid-cols-4">
      {views.map((item) => (
        <button key={item.id} onClick={() => setActiveView(item.id)} className={`py-2.5 text-xs font-semibold flex flex-col items-center gap-1 ${activeView === item.id ? 'text-emerald-600' : 'text-gray-500'}`}>
          <item.icon className="w-4 h-4" />
          {item.label}
        </button>
      ))}
    </div>
  </footer>
);

const PantryView = ({ pantry, addPantry }) => {
  const [item, setItem] = useState('');
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Pantry inventory</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex gap-2">
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add item (e.g., tomatoes)" className="flex-1 rounded-xl border border-gray-200 px-3 py-2" />
          <button onClick={() => { if (item.trim()) { addPantry(item.trim()); setItem(''); }}} className="rounded-xl bg-emerald-500 text-white px-4 inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pantry.length === 0 && <p className="text-sm text-gray-500">No pantry items yet.</p>}
          {pantry.map((p) => <span key={p} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">{p}</span>)}
        </div>
      </div>
    </section>
  );
};

const PlannerView = ({ mealPlan, saveMeal }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-900">Weekly planner</h2>
    <div className="grid md:grid-cols-2 gap-3">
      {weekDays.map((day) => (
        <div key={day} className="rounded-2xl bg-white border border-gray-100 p-4">
          <p className="font-semibold text-gray-900">{day}</p>
          <input
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder="Plan a meal"
            value={mealPlan[getDayKey(day)] || ''}
            onChange={(e) => saveMeal(getDayKey(day), e.target.value)}
          />
        </div>
      ))}
    </div>
  </section>
);

const NutritionView = ({ nutrition, setNutrition }) => {
  const pct = Math.min(100, Math.round((nutrition.consumed / Math.max(1, nutrition.goal)) * 100));
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Nutrition tracker</h2>
      <div className="rounded-2xl bg-white border border-gray-100 p-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm font-semibold text-gray-700">Daily goal
            <input type="number" value={nutrition.goal} onChange={(e) => setNutrition((p) => ({ ...p, goal: Number(e.target.value) || 0 }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
          <label className="text-sm font-semibold text-gray-700">Consumed
            <input type="number" value={nutrition.consumed} onChange={(e) => setNutrition((p) => ({ ...p, consumed: Number(e.target.value) || 0 }))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-sm text-emerald-700">Progress</p>
            <p className="text-2xl font-bold text-emerald-800">{pct}%</p>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [pantry, setPantry] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [nutrition, setNutrition] = useState({ goal: 2200, consumed: 0 });

  useEffect(() => {
    const boot = async () => {
      const session = await authService.getSession();
      setUser(session);
      if (session) {
        const dashboard = await dataService.getDashboard(session.id);
        setPantry(dashboard.pantry || []);
        setMealPlan(dashboard.mealPlan || {});
        setNutrition(dashboard.nutrition || { goal: 2200, consumed: 0 });
      }

      const recipes = await recipeApi.getFeatured();
      setFeatured(recipes);
      setLoading(false);
    };

    boot();
  }, []);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      dataService.saveDashboard(user.id, { pantry, mealPlan, nutrition }).catch((err) => console.error('Save error', err));
    }, 350);
    return () => clearTimeout(timer);
  }, [user, pantry, mealPlan, nutrition]);

  const onSearch = async (query) => {
    if (!query?.trim()) return;
    setSearchQuery(query);
    const results = await recipeApi.searchRecipes(query);
    setSearchResults(results);
  };

  const addPantry = (item) => {
    if (pantry.some((value) => value.toLowerCase() === item.toLowerCase())) return;
    setPantry((prev) => [...prev, item]);
  };

  const saveMeal = (day, value) => {
    setMealPlan((prev) => ({ ...prev, [day]: value }));
  };

  const heroStat = useMemo(() => ({
    pantryItems: pantry.length,
    plannedMeals: Object.values(mealPlan).filter(Boolean).length
  }), [pantry, mealPlan]);

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setPantry([]);
    setMealPlan({});
    setNutrition({ goal: 2200, consumed: 0 });
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Loading SurChef…</div>;
  }

  if (!user) {
    return <AuthPanel onAuth={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 md:pb-8">
      <DesktopSidebar open={sidebarOpen} setOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} onLogout={logout} user={user} />

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between md:pl-6">
          <button onClick={() => setSidebarOpen(true)} className="hidden md:inline-flex p-2 rounded-xl hover:bg-gray-100"><Menu className="w-5 h-5" /></button>
          <Logo compact />
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">Sign out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 md:pl-20 lg:pl-24 space-y-6">
        {activeView === 'home' && (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 md:p-10 text-white">
              <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
              <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold mb-4"><Heart className="w-3 h-3" /> Crafted for better cooking flow</p>
              <h1 className="text-3xl md:text-5xl font-extrabold">Cook smarter. Plan easier.</h1>
              <p className="mt-3 text-emerald-50">Search recipes, manage pantry inventory, and track weekly goals in one polished dashboard.</p>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 rounded-xl border border-white/30 bg-white/95 text-gray-900 px-4 py-3"
                  placeholder="Search recipes: ramen, burrito bowl, paneer curry..."
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSearch(heroInput); }}
                />
                <button onClick={() => onSearch(heroInput)} className="rounded-xl bg-gray-900/85 px-5 py-3 font-semibold inline-flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-white/10 px-3 py-2">Pantry items: <strong>{heroStat.pantryItems}</strong></div>
                <div className="rounded-xl bg-white/10 px-3 py-2">Meals planned: <strong>{heroStat.plannedMeals}</strong></div>
                <div className="rounded-xl bg-white/10 px-3 py-2">Nutrition goal: <strong>{nutrition.goal}</strong></div>
                <div className="rounded-xl bg-white/10 px-3 py-2">Source: <strong>{backendMeta.hasSupabase ? 'Cloud' : 'Local'}</strong></div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">{searchQuery ? `Search results: ${searchQuery}` : 'Featured recipes'}</h2>
                <span className="text-sm text-gray-500">Tap a recipe for details</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(searchQuery ? searchResults : featured).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
                ))}
              </div>
              {(searchQuery ? searchResults : featured).length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">No recipes yet. Add `VITE_SPOONACULAR_API_KEY` for live data.</div>
              )}
            </section>
          </>
        )}

        {activeView === 'pantry' && <PantryView pantry={pantry} addPantry={addPantry} />}
        {activeView === 'planner' && <PlannerView mealPlan={mealPlan} saveMeal={saveMeal} />}
        {activeView === 'nutrition' && <NutritionView nutrition={nutrition} setNutrition={setNutrition} />}
      </main>

      <MobileFooterNav activeView={activeView} setActiveView={setActiveView} />

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}

      <div className="fixed bottom-20 right-4 md:bottom-6 bg-white border border-gray-200 rounded-xl shadow px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
        <Info className="w-3 h-3 text-emerald-600" />
        Autosave enabled
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}

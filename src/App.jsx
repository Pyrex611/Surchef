import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChefHat,
  Home,
  LogOut,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
  TrendingUp
} from 'lucide-react';

const API_ROOT = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';
const FOOD_API_ROOT = import.meta.env.VITE_API_BASE_URL || 'https://api.spoonacular.com';
const FOOD_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';

const VIEWS = [
  { id: 'home', label: 'Discover', icon: Home },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'pantry', label: 'Pantry', icon: ShoppingBasket },
  { id: 'nutrition', label: 'Nutrition', icon: TrendingUp }
];

async function request(path, options = {}, token) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

const Brand = () => (
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white flex items-center justify-center shadow-md">
      <ChefHat className="h-5 w-5" />
    </div>
    <div>
      <h1 className="text-xl font-bold text-slate-900">SurChef</h1>
      <p className="text-xs text-slate-500">Cook smarter, live healthier</p>
    </div>
  </div>
);

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem('surchef-token', data.token);
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-7 space-y-6">
        <Brand />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-slate-600 text-sm">Save plans, track pantry and personalize your meals.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          )}
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Password (6+ chars)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-emerald-700 font-semibold"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}

function AppShell({ user, token, onLogout }) {
  const [activeView, setActiveView] = useState('home');
  const [query, setQuery] = useState('pasta');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [plannerForm, setPlannerForm] = useState({ day: 'Monday', mealType: 'Dinner', title: '', calories: 550 });
  const [pantryForm, setPantryForm] = useState({ name: '', quantity: '1 pack' });

  useEffect(() => {
    const loadPrivateData = async () => {
      const [plans, pantryItems] = await Promise.all([
        request('/meal-plans', {}, token),
        request('/pantry-items', {}, token)
      ]);
      setMealPlans(plans);
      setPantry(pantryItems);
    };

    loadPrivateData().catch(() => onLogout());
  }, [token, onLogout]);

  useEffect(() => {
    if (!FOOD_API_KEY) {
      setSearchError('Add VITE_SPOONACULAR_API_KEY in .env to enable live recipe search.');
      return;
    }

    const run = async () => {
      setSearchError('');
      setLoadingSearch(true);
      try {
        const response = await fetch(
          `${FOOD_API_ROOT}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=8&addRecipeInformation=true&apiKey=${FOOD_API_KEY}`
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Recipe search failed');
        setSearchResults(data.results || []);
      } catch (error) {
        setSearchError(error.message);
      } finally {
        setLoadingSearch(false);
      }
    };

    run();
  }, [query]);

  const calories = useMemo(() => mealPlans.reduce((acc, item) => acc + Number(item.calories || 0), 0), [mealPlans]);

  const addMealPlan = async (event) => {
    event.preventDefault();
    const item = await request('/meal-plans', { method: 'POST', body: JSON.stringify(plannerForm) }, token);
    setMealPlans((prev) => [item, ...prev]);
    setPlannerForm((prev) => ({ ...prev, title: '' }));
  };

  const addPantry = async (event) => {
    event.preventDefault();
    const item = await request('/pantry-items', { method: 'POST', body: JSON.stringify(pantryForm) }, token);
    setPantry((prev) => [item, ...prev]);
    setPantryForm({ name: '', quantity: '1 pack' });
  };

  const deleteMealPlan = async (id) => {
    await request(`/meal-plans/${id}`, { method: 'DELETE' }, token);
    setMealPlans((prev) => prev.filter((item) => item.id !== id));
  };

  const deletePantry = async (id) => {
    await request(`/pantry-items/${id}`, { method: 'DELETE' }, token);
    setPantry((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={onLogout} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100" title="Log out">
              <LogOut className="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:grid md:grid-cols-[220px_1fr] md:gap-6">
        <aside className="hidden md:block rounded-2xl bg-white p-3 border border-slate-200 h-fit sticky top-24">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium mb-1 ${
                activeView === view.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <view.icon className="h-4 w-4" />
              {view.label}
            </button>
          ))}
        </aside>

        <main className="space-y-6">
          {activeView === 'home' && (
            <section className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <h2 className="text-2xl md:text-3xl font-bold">Hi {user.name.split(' ')[0]}, what are we cooking today?</h2>
                <div className="mt-4 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-slate-800"
                    placeholder="Search healthy meals, desserts, vegan bowls..."
                  />
                  <button className="rounded-xl bg-white/20 px-4" title="Search">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {searchError && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{searchError}</p>}
              {loadingSearch ? <p className="text-slate-500">Loading recipes…</p> : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map((recipe) => (
                    <article key={recipe.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src={recipe.image} alt={recipe.title} className="h-40 w-full object-cover" />
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-12">{recipe.title}</h3>
                        <p className="mt-2 text-xs text-slate-500">Ready in {recipe.readyInMinutes || 30} min · Serves {recipe.servings || 2}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeView === 'planner' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Meal planner</h2>
              <form onSubmit={addMealPlan} className="grid gap-2 md:grid-cols-5">
                <input value={plannerForm.day} onChange={(e) => setPlannerForm((prev) => ({ ...prev, day: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Day" />
                <input value={plannerForm.mealType} onChange={(e) => setPlannerForm((prev) => ({ ...prev, mealType: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Meal" />
                <input required value={plannerForm.title} onChange={(e) => setPlannerForm((prev) => ({ ...prev, title: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Dish" />
                <input type="number" value={plannerForm.calories} onChange={(e) => setPlannerForm((prev) => ({ ...prev, calories: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Calories" />
                <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Add</button>
              </form>

              <div className="space-y-2">
                {mealPlans.length === 0 ? <p className="text-slate-500">No meals yet. Start planning your week.</p> : mealPlans.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{item.day} · {item.mealType}: {item.title}</p>
                      <p className="text-xs text-slate-500">{item.calories} kcal</p>
                    </div>
                    <button onClick={() => deleteMealPlan(item.id)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'pantry' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Pantry tracker</h2>
              <form onSubmit={addPantry} className="grid gap-2 md:grid-cols-3">
                <input required value={pantryForm.name} onChange={(e) => setPantryForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Item name" />
                <input value={pantryForm.quantity} onChange={(e) => setPantryForm((prev) => ({ ...prev, quantity: e.target.value }))} className="rounded-xl border px-3 py-2" placeholder="Quantity" />
                <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Add item</button>
              </form>

              <div className="space-y-2">
                {pantry.length === 0 ? <p className="text-slate-500">Your pantry is empty.</p> : pantry.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 flex justify-between items-center">
                    <p className="text-slate-800 font-medium">{item.name} <span className="text-xs text-slate-500">({item.quantity})</span></p>
                    <button onClick={() => deletePantry(item.id)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'nutrition' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="text-xl font-bold text-slate-900">Nutrition insights</h2>
              <p className="text-slate-600">Daily target: 2200 kcal</p>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min((calories / 2200) * 100, 100)}%` }} />
              </div>
              <p className="font-semibold text-slate-800">Planned weekly calories: {calories} kcal</p>
              <p className="text-sm text-slate-500">Derived from your saved meal plans. Keep balancing protein, fiber and hydration for better outcomes.</p>
            </section>
          )}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-slate-200 bg-white grid grid-cols-4 z-30">
        {VIEWS.map((view) => (
          <button key={view.id} onClick={() => setActiveView(view.id)} className={`py-3 flex flex-col items-center text-xs ${activeView === view.id ? 'text-emerald-600' : 'text-slate-500'}`}>
            <view.icon className="h-4 w-4" />
            {view.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('surchef-token'));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => Boolean(token));

  useEffect(() => {
    if (!token) {
      return;
    }

    request('/me', {}, token)
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('surchef-token');
        setToken(null);
      })
      .finally(() => setBooting(false));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('surchef-token');
    setToken(null);
    setUser(null);
  };

  if (booting) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading SurChef…</div>;
  }

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={(nextUser, nextToken) => { setUser(nextUser); setToken(nextToken); }} />;
  }

  return <AppShell user={user} token={token} onLogout={handleLogout} />;
}

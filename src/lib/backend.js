import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.spoonacular.com';

const LOCAL_USERS_KEY = 'surchef_users';
const LOCAL_SESSION_KEY = 'surchef_session';
const LOCAL_DATA_KEY = 'surchef_user_data';

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const randomId = () => Math.random().toString(36).slice(2, 10);

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getUserDataStore = () => read(LOCAL_DATA_KEY, {});

const setUserDataStore = (store) => write(LOCAL_DATA_KEY, store);

export const recipeApi = {
  async searchRecipes(query) {
    if (!API_KEY) return [];
    try {
      const response = await fetch(`${API_BASE}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search Error:', error);
      return [];
    }
  },

  async searchRecipesByIngredients(ingredients = []) {
    const cleaned = ingredients
      .map((item) => item?.trim())
      .filter(Boolean)
      .join(',');

    if (!API_KEY || !cleaned) return [];

    try {
      const response = await fetch(
        `${API_BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(cleaned)}&number=12&ranking=2&ignorePantry=true&apiKey=${API_KEY}`
      );
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.error('Ingredient Search Error:', error);
      return [];
    }
  },

  async getRecipeDetails(id) {
    if (!API_KEY) return null;
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
    if (!API_KEY) return [];
    try {
      const response = await fetch(`${API_BASE}/recipes/random?number=8&apiKey=${API_KEY}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Featured Error:', error);
      return [];
    }
  }
};

const fallbackAuth = {
  async signUp({ username, email, password }) {
    const users = read(LOCAL_USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email is already in use.');
    }

    const user = { id: randomId(), username, email, password, role: 'chef' };
    users.push(user);
    write(LOCAL_USERS_KEY, users);

    const safeUser = { id: user.id, username, email, role: user.role };
    write(LOCAL_SESSION_KEY, safeUser);
    return safeUser;
  },

  async signIn({ email, password }) {
    const users = read(LOCAL_USERS_KEY, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const safeUser = { id: user.id, username: user.username, email: user.email, role: user.role };
    write(LOCAL_SESSION_KEY, safeUser);
    return safeUser;
  },

  async signOut() {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  },

  async getSession() {
    return read(LOCAL_SESSION_KEY, null);
  }
};

const fallbackData = {
  async getDashboard(userId) {
    const store = getUserDataStore();
    return store[userId] || { pantry: [], mealPlan: {}, nutrition: { goal: 2200, consumed: 0 } };
  },

  async saveDashboard(userId, patch) {
    const store = getUserDataStore();
    store[userId] = { ...(store[userId] || {}), ...patch };
    setUserDataStore(store);
    return store[userId];
  }
};

const supabaseService = {
  async signUp({ username, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    const user = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || username,
      role: 'chef'
    };

    await this.saveDashboard(user.id, { pantry: [], mealPlan: {}, nutrition: { goal: 2200, consumed: 0 } });
    return user;
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || data.user.email.split('@')[0],
      role: 'chef'
    };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || data.user.email.split('@')[0],
      role: 'chef'
    };
  },

  async getDashboard(userId) {
    const { data, error } = await supabase.from('profiles').select('pantry, meal_plan, nutrition').eq('id', userId).single();
    if (error) {
      return { pantry: [], mealPlan: {}, nutrition: { goal: 2200, consumed: 0 } };
    }

    return {
      pantry: data.pantry || [],
      mealPlan: data.meal_plan || {},
      nutrition: data.nutrition || { goal: 2200, consumed: 0 }
    };
  },

  async saveDashboard(userId, patch) {
    const payload = {
      id: userId,
      pantry: patch.pantry,
      meal_plan: patch.mealPlan,
      nutrition: patch.nutrition,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('pantry, meal_plan, nutrition').single();

    if (error) throw error;

    return {
      pantry: data.pantry || [],
      mealPlan: data.meal_plan || {},
      nutrition: data.nutrition || { goal: 2200, consumed: 0 }
    };
  }
};

const authImpl = hasSupabase ? supabaseService : fallbackAuth;
const dataImpl = hasSupabase ? supabaseService : fallbackData;

export const backendMeta = {
  hasSupabase,
  providerLabel: hasSupabase ? 'Supabase (cloud sync enabled)' : 'Local fallback (set Supabase env vars for cloud sync)'
};

export const authService = {
  signUp: authImpl.signUp.bind(authImpl),
  signIn: authImpl.signIn.bind(authImpl),
  signOut: authImpl.signOut.bind(authImpl),
  getSession: authImpl.getSession.bind(authImpl)
};

export const dataService = {
  getDashboard: dataImpl.getDashboard.bind(dataImpl),
  saveDashboard: dataImpl.saveDashboard.bind(dataImpl)
};

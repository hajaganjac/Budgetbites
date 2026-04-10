import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Recipes } from './pages/Recipes';
import { RecipeGenerator } from './pages/RecipeGenerator';
import { GroceryNotes } from './pages/GroceryNotes';
import { Achievements } from './pages/Achievements';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true,          Component: Dashboard       },
      { path: 'recipes',      Component: Recipes         },
      { path: 'generate',     Component: RecipeGenerator },
      { path: 'grocery',      Component: GroceryNotes    },
      { path: 'achievements', Component: Achievements    },
    ],
  },
]);

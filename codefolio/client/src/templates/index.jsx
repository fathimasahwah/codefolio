import Minimalist from './Minimalist.jsx';
import Cyberpunk from './Cyberpunk.jsx';
import Corporate from './Corporate.jsx';

// templateId (stored on the user) -> layout component. Add a theme by adding one line here.
export const templateMap = { minimalist: Minimalist, cyberpunk: Cyberpunk, corporate: Corporate };
export const TEMPLATE_LABELS = { minimalist: 'Minimalist', cyberpunk: 'Cyberpunk', corporate: 'Corporate' };
export const DefaultLayout = Minimalist;

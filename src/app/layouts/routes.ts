import { RouteInfo } from "../models/routes.model";

export const ADMIN_ROUTES: RouteInfo[] = [
    { path: 'dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
    { path: 'user-profile', title: 'User Profile', icon: 'ni-single-02 text-yellow', class: '' },
    { path: 'tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '' },
    { path: 'icons', title: 'Icons', icon: 'ni-planet text-blue', class: '' },
    { path: 'maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '' }
];

export const STUDENT_ROUTES: RouteInfo[] = [
    { path: 'dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
    { path: 'user-profile', title: 'User Profile', icon: 'ni-single-02 text-yellow', class: '' },
    { path: 'products', title: 'Products', icon: 'ni-bullet-list-67 text-red', class: '' },
    { path: 'icons', title: 'Icons', icon: 'ni-planet text-blue', class: '' },
    { path: 'maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '' }
];

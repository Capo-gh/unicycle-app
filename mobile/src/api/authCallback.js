// Shared callback so the axios interceptor can trigger logout
// without needing access to the AuthContext directly.
let _logoutCallback = null;

export const setLogoutCallback = (fn) => {
    _logoutCallback = fn;
};

export const triggerLogout = () => {
    if (_logoutCallback) _logoutCallback();
};

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => {
      console.warn('Le mode hors ligne ne peut pas être activé.', error);
    });
  });
}

window.addEventListener('online', () => {
  if (typeof fetchWeather === 'function') fetchWeather();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && navigator.onLine && typeof fetchWeather === 'function') fetchWeather();
});
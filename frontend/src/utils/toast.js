// Toast notification utility
// Simple custom toast system without external dependencies

export const showToast = (message, type = 'success') => {
  // Remove any existing toast
  const existingToast = document.getElementById('custom-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out flex items-center gap-3 max-w-md`;
  
  // Style based on type
  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`
    },
    error: {
      bg: 'bg-red-500',
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>`
    },
    info: {
      bg: 'bg-blue-500',
      icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`
    }
  };

  const style = styles[type] || styles.success;
  toast.className += ` ${style.bg}`;

  toast.innerHTML = `
    <div class="flex-shrink-0">
      ${style.icon}
    </div>
    <p class="text-white font-medium flex-1">${message}</p>
    <button id="close-toast" class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  // Close button handler
  const closeBtn = toast.querySelector('#close-toast');
  const closeToast = () => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };
  
  closeBtn.addEventListener('click', closeToast);

  // Auto dismiss after 4 seconds
  setTimeout(closeToast, 4000);
};

export default showToast;

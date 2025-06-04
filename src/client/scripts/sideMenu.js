export function initSideMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('side-menu');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const logoutBtn = document.getElementById('logout-btn');

    function toggleMenu() {
        sideMenu.classList.toggle('open');
    }

    hamburgerBtn.addEventListener('click', toggleMenu);
    resumeBtn.addEventListener('click', toggleMenu);

    restartBtn.addEventListener('click', () => {
        location.reload();
    });

    logoutBtn.addEventListener('click', () => {
        // Supprimer les données de session
        localStorage.clear();
        sessionStorage.clear();
        
        // Rediriger vers la page de connexion
        const loginContainer = document.getElementById('login-container');
        const gameContainer = document.getElementById('game-container');
        
        gameContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        sideMenu.classList.remove('open');
    });
}

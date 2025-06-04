document.addEventListener('keydown', (event) => {
    const craftMenu = document.querySelector('.craft-menu');
    if (event.key.toLowerCase() === 'c') {
        if (craftMenu.style.display === 'none' || craftMenu.style.display === '') {
            craftMenu.style.display = 'block';
        } else {
            craftMenu.style.display = 'none';
        }
    }
});

const options = document.querySelectorAll('.select-option');

options.forEach(option => {
    option.addEventListener('click', () => {
        const activeClass = document.querySelector('.active')

        if (activeClass) {
            activeClass.classList.remove('active')
        }

        let contentInput

        options.forEach(opt => {
            const label = opt.querySelector('.option-label');
            contentInput = opt.querySelector('.content');

            label.textContent = label.getAttribute('for').replace('answer', '');
            label.style.backgroundColor = '';
            label.style.color = '';
            label.style.borderColor = '';
            contentInput.style.color = '';
        });

        const currentLabel = option.querySelector('.option-label');
        currentLabel.textContent = '✓';
        currentLabel.style.backgroundColor = '#0CC293';
        currentLabel.style.color = 'white';
        currentLabel.style.borderColor = '#0CC293';

        const radioInput = option.querySelector('input[type="radio"]');
        radioInput.checked = true;

        contentInput = option.querySelector('.content');
        contentInput.style.color = '#0CC293';
    });
});

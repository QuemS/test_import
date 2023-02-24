function getAlert(content, bgColorBootstrap) {
    const element = document.querySelector('.container-alert');
    element.innerHTML = `${content}`

    element.classList.remove('alert-close');
    element.classList.remove('fadeOutUp');
    element.classList.add(`alert-${bgColorBootstrap}`);
    element.classList.add('alert-open');
    element.classList.add('fadeInDown');


    setTimeout(() => {
        element.classList.add('fadeOutUp');
        element.classList.add('alert-close');
        element.classList.remove('alert-open');
        element.classList.remove('fadeInDown');

    }, 3000);
}

export {getAlert}
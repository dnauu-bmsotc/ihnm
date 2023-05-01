const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('section');

function changeTab(event) {
	event.preventDefault();
	const target = event.target.getAttribute('href');
	const section = document.querySelector(target);
	const topPos = section.offsetTop - 80;
	window.scrollTo({
		top: topPos,
		behavior: 'smooth'
	});
}

navLinks.forEach(link => {
	link.addEventListener('click', changeTab);
});

window.addEventListener('scroll', () => {
	const currentPos = window.scrollY;
	sections.forEach(section => {
		const top = section.offsetTop - 80;
		const bottom = top + section.offsetHeight;
		if (currentPos >= top && currentPos <= bottom) {
			navLinks.forEach(link => {
				link.classList.remove('active');
			});
			const target = `nav ul li a[href="#${section.getAttribute('id')}"]`;
			document.querySelector(target).classList.add('active');
		}
	});
});

import contactForm from './features/contactForm.json';
import footer from './layout/footer.json';
import navbar from './layout/navbar.json';
import blog from './pages/blog.json';
import globalNotFound from './pages/globalNotFound.json';
import home from './pages/home.json';
import contact from './validation/contact.json';

const messages = {
	features: {
		contactForm,
	},
	layout: {
		footer,
		navbar,
	},
	pages: {
		blog,
		globalNotFound,
		home,
	},
	validation: {
		contact,
	},
};

export default messages;

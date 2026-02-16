import type { LocalizedBlogPost } from './types';

export const BLOG_POSTS: LocalizedBlogPost[] = [
	{
		slug: 'skeletonhub-beta-launch',
		date: '2026-02-09',
		translations: {
			ru: {
				title: 'SkeletonHub Beta: запустили публичную версию платформы',
				excerpt:
					'Мы открыли публичный beta-доступ: обновили навигацию, ускорили рендер и сделали onboarding для новых команд.',
				content: [
					'Сегодня мы открыли публичный beta-доступ к SkeletonHub. Главная цель релиза - дать командам понятную точку входа: от первого запуска до публикации первого модуля без лишней настройки.',
					'В релиз вошли новый экран старта проекта, упрощенная навигация и переработанная структура документации. Теперь основные действия собраны в одном месте: создать проект, подключить шаблон, запустить локально, развернуть.',
					'Следующий фокус - улучшить сценарии для командной работы: права доступа, история изменений и более гибкие шаблоны окружений.',
				],
			},
			en: {
				title: 'SkeletonHub Beta: Public platform release',
				excerpt:
					'We opened public beta access, refreshed navigation, improved rendering speed, and streamlined onboarding for new teams.',
				content: [
					'Today we opened public beta access to SkeletonHub. The goal of this release is to give teams a clear starting point: from first run to shipping the first module without extra setup.',
					'The release includes a new project start screen, simplified navigation, and a redesigned documentation structure. Core actions are now in one place: create a project, apply a template, run locally, and deploy.',
					'Our next focus is team collaboration: access control, change history, and more flexible environment templates.',
				],
			},
		},
	},
	{
		slug: 'edge-cache-results',
		date: '2026-02-08',
		translations: {
			ru: {
				title: 'Минус 38% к времени загрузки: как сработал edge-кэш',
				excerpt:
					'Провели замеры после внедрения edge-кэширования и получили стабильное ускорение на первых экранах приложения.',
				content: [
					'На прошлой неделе мы включили новую стратегию кэширования на edge-слое. Измерения в реальном трафике показали среднее снижение TTFB на 38% для популярных страниц.',
					'Ключевой эффект появился не только на главной, но и на карточках контента: пользователи быстрее видят структуру страницы и раньше начинают взаимодействовать с интерфейсом.',
					'Сейчас мы расширяем политику кэша на API-ответы с коротким TTL, чтобы ускорение было заметно и в динамических разделах.',
				],
			},
			en: {
				title: 'Loading time down 38%: edge caching results',
				excerpt:
					'After introducing edge caching, measurements showed a consistent speedup on first-screen rendering.',
				content: [
					'Last week we enabled a new caching strategy on the edge layer. Real traffic measurements showed an average 38% reduction in TTFB for popular pages.',
					'The effect was visible not only on the home page, but also on content cards: users see structure sooner and start interacting earlier.',
					'We are now extending cache policy to API responses with short TTL, so the speedup remains noticeable in dynamic sections.',
				],
			},
		},
	},
	{
		slug: 'editor-with-ai-prompts',
		date: '2026-02-06',
		translations: {
			ru: {
				title: 'Новый редактор контента: шаблоны и AI-подсказки',
				excerpt:
					'Добавили редактор с шаблонами для новостей, релизов и заметок команды, плюс умные подсказки для структуры текста.',
				content: [
					'Мы обновили внутренний редактор контента и добавили три рабочих сценария: быстрый пост, релиз-ноты и разбор кейса. Каждый сценарий дает свою структуру, чтобы автор не начинал с пустого листа.',
					'AI-подсказки помогают расширять черновик: предлагают варианты заголовка, выделяют слабые абзацы и напоминают про факты, которые стоит уточнить.',
					'По фидбеку команды, время на подготовку публикации сократилось почти вдвое, а тексты стали заметно ровнее по качеству.',
				],
			},
			en: {
				title: 'New content editor: templates and AI prompts',
				excerpt:
					'We added templates for updates and release notes, plus smart prompts to improve article structure.',
				content: [
					'We upgraded our internal content editor and introduced three writing flows: quick post, release notes, and case breakdown. Each flow provides a structure so authors do not start from an empty page.',
					'AI prompts help expand drafts by suggesting headline options, highlighting weak paragraphs, and reminding authors to verify missing facts.',
					'Based on team feedback, publication prep time dropped significantly and content quality became more consistent.',
				],
			},
		},
	},
	{
		slug: 'accessibility-week',
		date: '2026-02-03',
		translations: {
			ru: {
				title: 'Неделя доступности: 27 улучшений для клавиатуры и screen reader',
				excerpt:
					'Закрыли крупный блок accessibility-задач: фокус-трапы, aria-атрибуты и корректные состояния интерактивных элементов.',
				content: [
					'В этом спринте мы сознательно замедлили выпуск фич и посвятили неделю доступности. Итог: 27 улучшений, которые напрямую влияют на удобство использования без мыши.',
					'Мы перепроверили фокус-порядок в модальных окнах, добавили недостающие aria-связки и исправили голосовые подписи для иконок и кнопок-иконок.',
					'Отдельно обновили чеклист для ревью, чтобы accessibility перестала быть разовой задачей и стала частью стандартного процесса разработки.',
				],
			},
			en: {
				title: 'Accessibility week: 27 improvements for keyboard and screen reader',
				excerpt:
					'We completed a major accessibility sprint: focus traps, ARIA bindings, and correct interactive states.',
				content: [
					'In this sprint we deliberately slowed down feature delivery and dedicated a full week to accessibility. Result: 27 improvements that directly impact keyboard-only usage.',
					'We reviewed focus order in modal dialogs, added missing ARIA relationships, and fixed voice labels for icon-only controls.',
					'We also updated the review checklist so accessibility becomes a standard part of delivery, not a one-time initiative.',
				],
			},
		},
	},
	{
		slug: 'design-system-v2',
		date: '2026-01-27',
		translations: {
			ru: {
				title: 'Design System v2: единые токены и предсказуемая типографика',
				excerpt:
					'Перешли на новую систему дизайн-токенов и унифицировали стили кнопок, заголовков и карточек во всех разделах.',
				content: [
					'Мы выпустили вторую версию дизайн-системы с едиными токенами цвета, отступов и радиусов. Это позволило убрать разночтения между страницами и ускорить сборку новых экранов.',
					'Вместо набора локальных исключений теперь используется единый слой переменных, что упростило поддержку тем и адаптацию под мобильные брейкпоинты.',
					'Команда фронтенда уже отмечает практический эффект: меньше правок по визуальной консистентности и быстрее review по UI.',
				],
			},
			en: {
				title: 'Design System v2: unified tokens and predictable typography',
				excerpt:
					'We migrated to a new design-token layer and unified button, heading, and card styles across the product.',
				content: [
					'We released version two of our design system with unified tokens for color, spacing, and radius. This reduced visual drift and sped up creation of new screens.',
					'Instead of many local exceptions, we now rely on a single variable layer, which simplified theme support and responsive adaptation.',
					'The frontend team already sees a practical impact: fewer visual consistency fixes and faster UI reviews.',
				],
			},
		},
	},
	{
		slug: 'observability-dashboard',
		date: '2025-12-19',
		translations: {
			ru: {
				title: 'Наблюдаемость в проде: собрали дашборд по ошибкам и latency',
				excerpt:
					'Подключили единый дашборд мониторинга, чтобы быстрее находить регрессии и понимать поведение системы под нагрузкой.',
				content: [
					'Мы объединили метрики приложения, API и базы данных в одном дашборде. Теперь команда видит не только факт ошибки, но и путь пользователя до нее.',
					'Добавили алерты на всплески latency и рост количества 5xx-ответов. Это уже помогло поймать два регресса до того, как их заметили пользователи.',
					'Следующий шаг - привязать ключевые бизнес-события к техническим метрикам, чтобы влияние инцидентов было видно не только в логах, но и в продуктовых показателях.',
				],
			},
			en: {
				title: 'Production observability: dashboard for errors and latency',
				excerpt:
					'We connected a unified monitoring dashboard to detect regressions earlier and understand behavior under load.',
				content: [
					'We combined application, API, and database metrics in a single dashboard. The team can now see not only an error event, but also user path leading to it.',
					'We added alerts for latency spikes and 5xx growth. This already helped us catch two regressions before users reported them.',
					'Next step: map key business events to technical metrics so incident impact is visible beyond logs.',
				],
			},
		},
	},
	{
		slug: 'community-roadmap-2026',
		date: '2025-11-28',
		translations: {
			ru: {
				title: 'Roadmap 2026: что просило сообщество и что мы берем в работу',
				excerpt:
					'Собрали пожелания пользователей и сформировали публичный roadmap: приоритеты, этапы и ожидаемые сроки.',
				content: [
					'За последние месяцы мы получили десятки предложений от сообщества: от интеграций с внешними сервисами до более гибкой системы ролей.',
					'В roadmap 2026 в приоритет попали три направления: производительность больших проектов, расширяемость через плагины и зрелые инструменты командной работы.',
					'Мы будем публиковать прогресс по каждому пункту ежемесячно, чтобы план развития был прозрачным и предсказуемым для всех, кто строит продукты на SkeletonHub.',
				],
			},
			en: {
				title: 'Roadmap 2026: community requests and our priorities',
				excerpt:
					'We collected user requests and published a roadmap with priorities, phases, and expected timelines.',
				content: [
					'In recent months we received dozens of requests from the community: from third-party integrations to a more flexible roles model.',
					'Roadmap 2026 focuses on three directions: performance for large projects, plugin-based extensibility, and mature collaboration tooling.',
					'We will publish monthly updates on each point to keep the plan transparent and predictable for teams building on SkeletonHub.',
				],
			},
		},
	},
];

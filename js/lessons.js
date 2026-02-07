/**
 * Thematic Lessons Database
 * Organized by theme and CEFR level (A1-C2)
 */

const LESSONS_DB = {
    // Theme 1: Daily Routines
    'daily-routines': {
        id: 'daily-routines',
        name: 'Daily Routines',
        icon: '🏠',
        description: 'Learn vocabulary about everyday activities',
        color: '#10b981',

        levels: {
            'A1': {
                title: 'Basic Daily Activities',
                vocabulary: [
                    { word: 'WAKE UP', translation: 'Acordar', phonetic: '/weɪk ʌp/' },
                    { word: 'BREAKFAST', translation: 'Café da manhã', phonetic: '/ˈbrekfəst/' },
                    { word: 'SHOWER', translation: 'Banho', phonetic: '/ˈʃaʊər/' },
                    { word: 'BRUSH', translation: 'Escovar', phonetic: '/brʌʃ/' },
                    { word: 'DRESS', translation: 'Vestir', phonetic: '/dres/' },
                    { word: 'LUNCH', translation: 'Almoço', phonetic: '/lʌntʃ/' },
                    { word: 'DINNER', translation: 'Jantar', phonetic: '/ˈdɪnər/' },
                    { word: 'SLEEP', translation: 'Dormir', phonetic: '/sliːp/' },
                    { word: 'WORK', translation: 'Trabalhar', phonetic: '/wɜːrk/' },
                    { word: 'HOME', translation: 'Casa', phonetic: '/hoʊm/' },
                    { word: 'EAT', translation: 'Comer', phonetic: '/iːt/' },
                    { word: 'DRINK', translation: 'Beber', phonetic: '/drɪŋk/' }
                ],
                sentences: [
                    'I wake up at seven o\'clock.',
                    'I eat breakfast every morning.',
                    'She takes a shower before work.',
                    'We have lunch at noon.',
                    'He goes to work by bus.',
                    'They come home at six.',
                    'I brush my teeth twice a day.',
                    'She cooks dinner for her family.',
                    'We watch TV in the evening.',
                    'I go to sleep at ten.'
                ]
            },

            'A2': {
                title: 'Daily Routine Details',
                vocabulary: [
                    { word: 'SCHEDULE', translation: 'Cronograma', phonetic: '/ˈskedʒuːl/' },
                    { word: 'MORNING', translation: 'Manhã', phonetic: '/ˈmɔːrnɪŋ/' },
                    { word: 'AFTERNOON', translation: 'Tarde', phonetic: '/ˌæftərˈnuːn/' },
                    { word: 'EVENING', translation: 'Noite', phonetic: '/ˈiːvnɪŋ/' },
                    { word: 'EXERCISE', translation: 'Exercitar', phonetic: '/ˈeksərsaɪz/' },
                    { word: 'COMMUTE', translation: 'Deslocamento', phonetic: '/kəˈmjuːt/' },
                    { word: 'PREPARE', translation: 'Preparar', phonetic: '/prɪˈper/' },
                    { word: 'ARRIVE', translation: 'Chegar', phonetic: '/əˈraɪv/' },
                    { word: 'LEAVE', translation: 'Sair', phonetic: '/liːv/' },
                    { word: 'REST', translation: 'Descansar', phonetic: '/rest/' }
                ],
                sentences: [
                    'My morning routine includes exercise and breakfast.',
                    'I usually commute to work by train.',
                    'She prepares lunch for her children.',
                    'We arrive at the office around nine.',
                    'He leaves work at five in the afternoon.',
                    'They rest for an hour after dinner.',
                    'I organize my schedule every Sunday.',
                    'She exercises three times a week.',
                    'The evening is my favorite time of day.',
                    'We spend quality time together on weekends.'
                ]
            },

            'B1': {
                title: 'Organizing Your Day',
                vocabulary: [
                    { word: 'ROUTINE', translation: 'Rotina', phonetic: '/ruːˈtiːn/' },
                    { word: 'ORGANIZE', translation: 'Organizar', phonetic: '/ˈɔːrɡənaɪz/' },
                    { word: 'APPOINTMENT', translation: 'Compromisso', phonetic: '/əˈpɔɪntmənt/' },
                    { word: 'PRIORITY', translation: 'Prioridade', phonetic: '/praɪˈɔːrəti/' },
                    { word: 'PRODUCTIVE', translation: 'Produtivo', phonetic: '/prəˈdʌktɪv/' },
                    { word: 'BALANCE', translation: 'Equilíbrio', phonetic: '/ˈbæləns/' },
                    { word: 'EFFICIENT', translation: 'Eficiente', phonetic: '/ɪˈfɪʃənt/' },
                    { word: 'MANAGE', translation: 'Gerenciar', phonetic: '/ˈmænɪdʒ/' }
                ],
                sentences: [
                    'I try to maintain a healthy morning routine.',
                    'Organizing your day helps you be more productive.',
                    'She has an important appointment this afternoon.',
                    'Setting priorities is essential for time management.',
                    'A balanced lifestyle includes work and relaxation.',
                    'Being efficient at work allows more free time.',
                    'I manage my time by creating daily to-do lists.',
                    'Regular exercise is part of my weekly routine.'
                ]
            },

            'B2': {
                title: 'Productivity and Habits',
                vocabulary: [
                    { word: 'SYSTEMATIC', translation: 'Sistemático', phonetic: '/ˌsɪstəˈmætɪk/' },
                    { word: 'CONSISTENCY', translation: 'Consistência', phonetic: '/kənˈsɪstənsi/' },
                    { word: 'DISCIPLINE', translation: 'Disciplina', phonetic: '/ˈdɪsəplɪn/' },
                    { word: 'OPTIMIZE', translation: 'Otimizar', phonetic: '/ˈɑːptɪmaɪz/' },
                    { word: 'HABITUAL', translation: 'Habitual', phonetic: '/həˈbɪtʃuəl/' },
                    { word: 'STREAMLINE', translation: 'Simplificar', phonetic: '/ˈstriːmlaɪn/' }
                ],
                sentences: [
                    'Developing systematic habits leads to long-term success.',
                    'Consistency in your routine builds strong discipline.',
                    'I\'ve learned to optimize my morning for maximum productivity.',
                    'Habitual behaviors can significantly impact your well-being.',
                    'Streamlining your daily tasks saves valuable time.',
                    'A disciplined approach to work-life balance is crucial.'
                ]
            },

            'C1': {
                title: 'Advanced Time Management',
                vocabulary: [
                    { word: 'METICULOUS', translation: 'Meticuloso', phonetic: '/məˈtɪkjələs/' },
                    { word: 'REGIMENTED', translation: 'Regrado', phonetic: '/ˈredʒɪmentɪd/' },
                    { word: 'DELIBERATE', translation: 'Deliberado', phonetic: '/dɪˈlɪbərət/' },
                    { word: 'SYNCHRONIZE', translation: 'Sincronizar', phonetic: '/ˈsɪŋkrənaɪz/' }
                ],
                sentences: [
                    'Her meticulous approach to planning ensures nothing is overlooked.',
                    'A regimented schedule can enhance both productivity and creativity.',
                    'Making deliberate choices about your time allocation is empowering.',
                    'Synchronizing your biological rhythm with your work schedule optimizes performance.'
                ]
            },

            'C2': {
                title: 'Lifestyle Philosophy',
                vocabulary: [
                    { word: 'CIRCADIAN', translation: 'Circadiano', phonetic: '/sərˈkeɪdiən/' },
                    { word: 'PARADIGM', translation: 'Paradigma', phonetic: '/ˈpærədaɪm/' },
                    { word: 'CONDUCIVE', translation: 'Propício', phonetic: '/kənˈduːsɪv/' }
                ],
                sentences: [
                    'Understanding your circadian rhythm can revolutionize your daily routine.',
                    'Shifting your paradigm about productivity requires introspection.',
                    'Creating an environment conducive to focus enhances cognitive performance.'
                ]
            }
        }
    },

    // Theme 2: Travel & Tourism
    'travel': {
        id: 'travel',
        name: 'Travel & Tourism',
        icon: '✈️',
        description: 'Essential vocabulary for travelers',
        color: '#22d3ee',

        levels: {
            'A1': {
                title: 'Travel Basics',
                vocabulary: [
                    { word: 'AIRPORT', translation: 'Aeroporto', phonetic: '/ˈerpɔːrt/' },
                    { word: 'TICKET', translation: 'Bilhete', phonetic: '/ˈtɪkɪt/' },
                    { word: 'PASSPORT', translation: 'Passaporte', phonetic: '/ˈpæspɔːrt/' },
                    { word: 'HOTEL', translation: 'Hotel', phonetic: '/hoʊˈtel/' },
                    { word: 'LUGGAGE', translation: 'Bagagem', phonetic: '/ˈlʌɡɪdʒ/' },
                    { word: 'FLIGHT', translation: 'Voo', phonetic: '/flaɪt/' },
                    { word: 'TAXI', translation: 'Táxi', phonetic: '/ˈtæksi/' },
                    { word: 'TRAIN', translation: 'Trem', phonetic: '/treɪn/' },
                    { word: 'BUS', translation: 'Ônibus', phonetic: '/bʌs/' },
                    { word: 'MAP', translation: 'Mapa', phonetic: '/mæp/' }
                ],
                sentences: [
                    'I need to check my passport.',
                    'Where is the airport?',
                    'I have one ticket to London.',
                    'The hotel is very nice.',
                    'My luggage is heavy.',
                    'What time is the flight?',
                    'Can I take a taxi?',
                    'The train leaves at noon.',
                    'Is there a bus to the city?',
                    'I need a map, please.'
                ]
            },

            'A2': {
                title: 'Planning a Trip',
                vocabulary: [
                    { word: 'RESERVATION', translation: 'Reserva', phonetic: '/ˌrezərˈveɪʃən/' },
                    { word: 'DESTINATION', translation: 'Destino', phonetic: '/ˌdestɪˈneɪʃən/' },
                    { word: 'DEPARTURE', translation: 'Partida', phonetic: '/dɪˈpɑːrtʃər/' },
                    { word: 'ARRIVAL', translation: 'Chegada', phonetic: '/əˈraɪvəl/' },
                    { word: 'BOARDING', translation: 'Embarque', phonetic: '/ˈbɔːrdɪŋ/' },
                    { word: 'CUSTOMS', translation: 'Alfândega', phonetic: '/ˈkʌstəmz/' },
                    { word: 'CURRENCY', translation: 'Moeda', phonetic: '/ˈkɜːrənsi/' },
                    { word: 'TOURIST', translation: 'Turista', phonetic: '/ˈtʊrɪst/' }
                ],
                sentences: [
                    'I made a hotel reservation for three nights.',
                    'Paris is my favorite destination.',
                    'The departure time is 8:00 AM.',
                    'Our arrival is scheduled for tomorrow.',
                    'Boarding begins in thirty minutes.',
                    'We need to go through customs.',
                    'What currency do they use here?',
                    'Many tourists visit this museum.'
                ]
            },

            'B1': {
                title: 'Travel Experiences',
                vocabulary: [
                    { word: 'ITINERARY', translation: 'Itinerário', phonetic: '/aɪˈtɪnəreri/' },
                    { word: 'ACCOMMODATION', translation: 'Acomodação', phonetic: '/əˌkɑːməˈdeɪʃən/' },
                    { word: 'SIGHTSEEING', translation: 'Turismo', phonetic: '/ˈsaɪtsiːɪŋ/' },
                    { word: 'EXCURSION', translation: 'Excursão', phonetic: '/ɪkˈskɜːrʒən/' },
                    { word: 'LANDMARK', translation: 'Ponto turístico', phonetic: '/ˈlændmɑːrk/' },
                    { word: 'SOUVENIR', translation: 'Lembrança', phonetic: '/ˌsuːvəˈnɪr/' }
                ],
                sentences: [
                    'Our itinerary includes five cities in two weeks.',
                    'The accommodation was comfortable and affordable.',
                    'We spent the day sightseeing around the old town.',
                    'The excursion to the mountains was breathtaking.',
                    'This cathedral is a famous landmark.',
                    'I bought souvenirs for my family.'
                ]
            },

            'B2': {
                title: 'Cultural Immersion',
                vocabulary: [
                    { word: 'AUTHENTIC', translation: 'Autêntico', phonetic: '/ɔːˈθentɪk/' },
                    { word: 'CUISINE', translation: 'Culinária', phonetic: '/kwɪˈziːn/' },
                    { word: 'HERITAGE', translation: 'Patrimônio', phonetic: '/ˈherɪtɪdʒ/' },
                    { word: 'IMMERSE', translation: 'Imergir', phonetic: '/ɪˈmɜːrs/' },
                    { word: 'VENTURE', translation: 'Aventurar', phonetic: '/ˈventʃər/' }
                ],
                sentences: [
                    'We sought authentic experiences rather than tourist traps.',
                    'The local cuisine exceeded all our expectations.',
                    'This site is part of UNESCO World Heritage.',
                    'Immersing yourself in the culture enriches the experience.',
                    'We ventured off the beaten path to explore hidden gems.'
                ]
            },

            'C1': {
                title: 'Travel Industry',
                vocabulary: [
                    { word: 'EXPATRIATE', translation: 'Expatriado', phonetic: '/eksˈpeɪtriət/' },
                    { word: 'BUREAUCRACY', translation: 'Burocracia', phonetic: '/bjʊˈrɑːkrəsi/' },
                    { word: 'QUARANTINE', translation: 'Quarentena', phonetic: '/ˈkwɔːrəntiːn/' },
                    { word: 'VISA', translation: 'Visto', phonetic: '/ˈviːzə/' }
                ],
                sentences: [
                    'As an expatriate, navigating local bureaucracy can be challenging.',
                    'Quarantine regulations vary significantly between countries.',
                    'Obtaining a work visa requires extensive documentation.'
                ]
            },

            'C2': {
                title: 'Global Mobility',
                vocabulary: [
                    { word: 'COSMOPOLITAN', translation: 'Cosmopolita', phonetic: '/ˌkɑːzməˈpɑːlɪtən/' },
                    { word: 'NOMADIC', translation: 'Nômade', phonetic: '/noʊˈmædɪk/' },
                    { word: 'WANDERLUST', translation: 'Paixão por viajar', phonetic: '/ˈwɑːndərlʌst/' }
                ],
                sentences: [
                    'The cosmopolitan nature of the city attracts people worldwide.',
                    'Digital nomadic lifestyles are increasingly prevalent.',
                    'Her wanderlust drove her to explore remote destinations.'
                ]
            }
        }
    },

    // Theme 3: Business & Work
    'business': {
        id: 'business',
        name: 'Business & Work',
        icon: '💼',
        description: 'Professional vocabulary for the workplace',
        color: '#667eea',

        levels: {
            'A1': {
                title: 'Office Basics',
                vocabulary: [
                    { word: 'OFFICE', translation: 'Escritório', phonetic: '/ˈɔːfɪs/' },
                    { word: 'DESK', translation: 'Mesa', phonetic: '/desk/' },
                    { word: 'COMPUTER', translation: 'Computador', phonetic: '/kəmˈpjuːtər/' },
                    { word: 'MEETING', translation: 'Reunião', phonetic: '/ˈmiːtɪŋ/' },
                    { word: 'BOSS', translation: 'Chefe', phonetic: '/bɔːs/' },
                    { word: 'EMPLOYEE', translation: 'Funcionário', phonetic: '/ɪmˈplɔɪiː/' },
                    { word: 'SALARY', translation: 'Salário', phonetic: '/ˈsæləri/' },
                    { word: 'EMAIL', translation: 'E-mail', phonetic: '/ˈiːmeɪl/' }
                ],
                sentences: [
                    'I work in an office.',
                    'My desk is near the window.',
                    'I use a computer every day.',
                    'We have a meeting at ten.',
                    'My boss is very nice.',
                    'She is a new employee.',
                    'What is your salary?',
                    'Please send me an email.'
                ]
            },

            'A2': {
                title: 'Office Life',
                vocabulary: [
                    { word: 'COLLEAGUE', translation: 'Colega', phonetic: '/ˈkɑːliːɡ/' },
                    { word: 'PROJECT', translation: 'Projeto', phonetic: '/ˈprɑːdʒekt/' },
                    { word: 'DEADLINE', translation: 'Prazo', phonetic: '/ˈdedlaɪn/' },
                    { word: 'DOCUMENT', translation: 'Documento', phonetic: '/ˈdɑːkjumənt/' },
                    { word: 'PRESENTATION', translation: 'Apresentação', phonetic: '/ˌprezənˈteɪʃən/' },
                    { word: 'SCHEDULE', translation: 'Agenda', phonetic: '/ˈskedʒuːl/' },
                    { word: 'CLIENT', translation: 'Cliente', phonetic: '/ˈklaɪənt/' }
                ],
                sentences: [
                    'My colleagues are very helpful.',
                    'We are working on a new project.',
                    'The deadline is next Friday.',
                    'I need to review this document.',
                    'She gave an excellent presentation.',
                    'Check your schedule for tomorrow.',
                    'Our client wants to meet next week.'
                ]
            },

            'B1': {
                title: 'Professional Communication',
                vocabulary: [
                    { word: 'NEGOTIATE', translation: 'Negociar', phonetic: '/nɪˈɡoʊʃieɪt/' },
                    { word: 'PROPOSAL', translation: 'Proposta', phonetic: '/prəˈpoʊzəl/' },
                    { word: 'CONTRACT', translation: 'Contrato', phonetic: '/ˈkɑːntrækt/' },
                    { word: 'STRATEGY', translation: 'Estratégia', phonetic: '/ˈstrætədʒi/' },
                    { word: 'OBJECTIVE', translation: 'Objetivo', phonetic: '/əbˈdʒektɪv/' },
                    { word: 'REVENUE', translation: 'Receita', phonetic: '/ˈrevənuː/' }
                ],
                sentences: [
                    'We need to negotiate better terms.',
                    'The proposal was accepted by management.',
                    'Both parties signed the contract.',
                    'Our strategy focuses on customer satisfaction.',
                    'What are the main objectives this quarter?',
                    'Revenue increased by 15% this year.'
                ]
            },

            'B2': {
                title: 'Business Strategy',
                vocabulary: [
                    { word: 'STAKEHOLDER', translation: 'Parte interessada', phonetic: '/ˈsteɪkhoʊldər/' },
                    { word: 'IMPLEMENTATION', translation: 'Implementação', phonetic: '/ˌɪmplɪmenˈteɪʃən/' },
                    { word: 'BENCHMARK', translation: 'Referência', phonetic: '/ˈbentʃmɑːrk/' },
                    { word: 'LEVERAGE', translation: 'Alavancar', phonetic: '/ˈlevərɪdʒ/' },
                    { word: 'SCALABLE', translation: 'Escalável', phonetic: '/ˈskeɪləbəl/' }
                ],
                sentences: [
                    'All stakeholders must be consulted before proceeding.',
                    'The implementation phase begins next month.',
                    'We use industry benchmarks to measure performance.',
                    'We can leverage our existing resources effectively.',
                    'The solution needs to be scalable for future growth.'
                ]
            },

            'C1': {
                title: 'Corporate Leadership',
                vocabulary: [
                    { word: 'PARADIGM', translation: 'Paradigma', phonetic: '/ˈpærədaɪm/' },
                    { word: 'SYNERGY', translation: 'Sinergia', phonetic: '/ˈsɪnərdʒi/' },
                    { word: 'DISRUPTIVE', translation: 'Disruptivo', phonetic: '/dɪsˈrʌptɪv/' },
                    { word: 'HOLISTIC', translation: 'Holístico', phonetic: '/hoʊˈlɪstɪk/' }
                ],
                sentences: [
                    'We\'re shifting our business paradigm to adapt to market changes.',
                    'The merger creates synergy between both companies.',
                    'This disruptive technology will transform the industry.',
                    'A holistic approach considers all aspects of the business.'
                ]
            },

            'C2': {
                title: 'Executive Perspective',
                vocabulary: [
                    { word: 'FIDUCIARY', translation: 'Fiduciário', phonetic: '/fɪˈduːʃieri/' },
                    { word: 'PROVISIONAL', translation: 'Provisório', phonetic: '/prəˈvɪʒənəl/' },
                    { word: 'CONTINGENCY', translation: 'Contingência', phonetic: '/kənˈtɪndʒənsi/' }
                ],
                sentences: [
                    'Directors have fiduciary responsibilities to shareholders.',
                    'These are provisional figures pending final audit.',
                    'We\'ve developed contingency plans for various scenarios.'
                ]
            }
        }
    }
};

// Lesson Management Class
class LessonManager {
    constructor() {
        this.currentTheme = null;
        this.currentLevel = null;
    }

    // Get all available themes
    getThemes() {
        return Object.values(LESSONS_DB);
    }

    // Get specific theme
    getTheme(themeId) {
        return LESSONS_DB[themeId];
    }

    // Get specific lesson (theme + level)
    getLesson(themeId, level) {
        const theme = LESSONS_DB[themeId];
        if (!theme || !theme.levels[level]) return null;

        return {
            ...theme.levels[level],
            themeId,
            themeName: theme.name,
            themeIcon: theme.icon,
            level
        };
    }

    // Set current lesson
    setCurrentLesson(themeId, level) {
        this.currentTheme = themeId;
        this.currentLevel = level;

        if (typeof Storage !== 'undefined') {
            localStorage.setItem('currentLesson', JSON.stringify({ themeId, level }));
        }
    }

    // Get current lesson
    getCurrentLesson() {
        if (this.currentTheme && this.currentLevel) {
            return this.getLesson(this.currentTheme, this.currentLevel);
        }

        // Try to load from storage
        if (typeof Storage !== 'undefined') {
            const stored = localStorage.getItem('currentLesson');
            if (stored) {
                const { themeId, level } = JSON.parse(stored);
                this.currentTheme = themeId;
                this.currentLevel = level;
                return this.getLesson(themeId, level);
            }
        }

        // Default to first lesson
        return this.getLesson('daily-routines', 'A1');
    }

    // Get vocabulary for games
    getVocabularyPairs(themeId, level) {
        const lesson = this.getLesson(themeId, level);
        if (!lesson || !lesson.vocabulary) return [];

        return lesson.vocabulary.map(item => ({
            english: item.word,
            portuguese: item.translation,
            phonetic: item.phonetic
        }));
    }

    // Get sentences for typing/listening
    getSentences(themeId, level) {
        const lesson = this.getLesson(themeId, level);
        return lesson?.sentences || [];
    }

    // Get words for pronunciation
    getPronunciationWords(themeId, level) {
        const lesson = this.getLesson(themeId, level);
        if (!lesson || !lesson.vocabulary) return [];

        return lesson.vocabulary.map(item => ({
            word: item.word,
            phonetic: item.phonetic,
            tip: item.translation
        }));
    }

    // Get all CEFR levels
    getLevels() {
        return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    }

    // Get level info
    getLevelInfo(level) {
        const info = {
            'A1': { name: 'Beginner', color: '#10b981', description: 'Basic words and phrases' },
            'A2': { name: 'Elementary', color: '#34d399', description: 'Simple daily expressions' },
            'B1': { name: 'Intermediate', color: '#f59e0b', description: 'Common situations' },
            'B2': { name: 'Upper Intermediate', color: '#f97316', description: 'Complex topics' },
            'C1': { name: 'Advanced', color: '#ef4444', description: 'Fluent expression' },
            'C2': { name: 'Proficient', color: '#dc2626', description: 'Native-like mastery' }
        };
        return info[level] || info['A1'];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LESSONS_DB, LessonManager };
}

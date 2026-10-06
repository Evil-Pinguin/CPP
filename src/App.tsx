import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  Flame,
  Gauge,
  Gem,
  Heart,
  Hexagon,
  Lightbulb,
  LockKeyhole,
  Menu,
  Play,
  Puzzle,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  X,
  Zap,
} from 'lucide-react'

type RunStatus = 'idle' | 'running' | 'error' | 'success'
type Toast = { id: number; message: string; tone: 'success' | 'info' }
type CourseLessonIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17

const lessonOffsets = [0, 4, 7, 11, 14] as const

const initialCode = 'int coins = 0;'

const solvedLine = 'int coins = 10;'

const lessonGroups = [
  {
    chapter: 'Глава 1',
    title: 'Самое начало',
    lessons: [
      { title: 'Меняем число', meta: '5 мин', state: 'active' },
      { title: 'Даём данным имя', meta: '5 мин', state: 'locked' },
      { title: 'Складываем числа', meta: '6 мин', state: 'locked' },
      { title: 'Показываем текст', meta: '7 мин', state: 'locked' },
    ],
  },
  {
    chapter: 'Глава 2',
    title: 'Учимся решать',
    lessons: [
      { title: 'Если — то', meta: '8 мин', state: 'locked' },
      { title: 'Повторяем действия', meta: '9 мин', state: 'locked' },
      { title: 'Своя команда', meta: '10 мин', state: 'locked' },
    ],
  },
  {
    chapter: 'Глава 3',
    title: 'C++ глубже',
    lessons: [
      { title: 'Да или нет: bool', meta: '9 мин', state: 'locked' },
      { title: 'Параметры функций', meta: '11 мин', state: 'locked' },
      { title: 'Список значений', meta: '12 мин', state: 'locked' },
      { title: 'Классы и объекты', meta: '14 мин', state: 'locked' },
    ],
  },
  {
    chapter: 'Глава 4',
    title: 'Unreal Engine',
    lessons: [
      { title: 'Переходим в Unreal', meta: '10 мин', state: 'locked' },
      { title: 'Первый Actor', meta: '12 мин', state: 'locked' },
      { title: 'Событие BeginPlay', meta: '12 мин', state: 'locked' },
    ],
  },
  {
    chapter: 'Глава 5',
    title: 'Игровая логика',
    lessons: [
      { title: 'Tick и кадры', meta: '12 мин', state: 'locked' },
      { title: 'Компоненты Actor', meta: '14 мин', state: 'locked' },
      { title: 'Столкновение', meta: '14 мин', state: 'locked' },
      { title: 'Таймер события', meta: '15 мин', state: 'locked' },
    ],
  },
]

const slides = [
  { label: 'Теория', short: '01' },
  { label: 'Выбор', short: '02' },
  { label: 'Разбор', short: '03' },
  { label: 'Собираем', short: '04' },
  { label: 'Пишем', short: '05' },
  { label: 'Закрепляем', short: '06' },
  { label: 'Итог', short: '07' },
]

const shuffledCodePieces = ['coins', '10', 'int', ';', '=']
const correctCodePieces = ['int', 'coins', '=', '10', ';']

function App() {
  const [currentLesson, setCurrentLesson] = useState<CourseLessonIndex>(0)
  const [activeSlide, setActiveSlide] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [explanationOpen, setExplanationOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [code, setCode] = useState(initialCode)
  const [runStatus, setRunStatus] = useState<RunStatus>('idle')
  const [consoleLines, setConsoleLines] = useState<string[]>([
    'Здесь появится результат.',
    'Измени число и нажми «Проверить».',
  ])
  const [xp, setXp] = useState(() => Number(localStorage.getItem('evilpin-xp')) || 0)
  const [completed, setCompleted] = useState(() => localStorage.getItem('evilpin-number-v2-done') === '1')
  const [warmupAnswer, setWarmupAnswer] = useState<number | null>(null)
  const [warmupSolved, setWarmupSolved] = useState(() => localStorage.getItem('evilpin-number-v2-choice-done') === '1')
  const [assemblySolved, setAssemblySolved] = useState(() => localStorage.getItem('evilpin-number-v2-assembly-done') === '1')
  const [tokenBank, setTokenBank] = useState<string[]>(() => localStorage.getItem('evilpin-number-v2-assembly-done') === '1' ? [] : shuffledCodePieces)
  const [codePieces, setCodePieces] = useState<string[]>(() => localStorage.getItem('evilpin-number-v2-assembly-done') === '1' ? correctCodePieces : [])
  const [assemblyError, setAssemblyError] = useState(false)
  const [reinforcementCode, setReinforcementCode] = useState('int gems = 0;')
  const [reinforcementStatus, setReinforcementStatus] = useState<RunStatus>(() => localStorage.getItem('evilpin-number-v3-reinforcement-done') === '1' ? 'success' : 'idle')
  const reinforcementSolved = reinforcementStatus === 'success'
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizSolved, setQuizSolved] = useState(() => localStorage.getItem('evilpin-number-v3-quiz-done') === '1')
  const [lessonTwoDone, setLessonTwoDone] = useState(() => localStorage.getItem('evilpin-names-complete') === '1')
  const [lessonThreeDone, setLessonThreeDone] = useState(() => localStorage.getItem('evilpin-math-complete') === '1')
  const [lessonFourDone, setLessonFourDone] = useState(() => localStorage.getItem('evilpin-output-complete') === '1')
  const [lessonFiveDone, setLessonFiveDone] = useState(() => localStorage.getItem('evilpin-condition-complete') === '1')
  const [lessonSixDone, setLessonSixDone] = useState(() => localStorage.getItem('evilpin-loop-complete') === '1')
  const [lessonSevenDone, setLessonSevenDone] = useState(() => localStorage.getItem('evilpin-function-complete') === '1')
  const [boolDone, setBoolDone] = useState(() => localStorage.getItem('evilpin-bool-complete') === '1')
  const [parametersDone, setParametersDone] = useState(() => localStorage.getItem('evilpin-parameters-complete') === '1')
  const [arraysDone, setArraysDone] = useState(() => localStorage.getItem('evilpin-arrays-complete') === '1')
  const [classesDone, setClassesDone] = useState(() => localStorage.getItem('evilpin-class-basics-complete') === '1')
  const [unrealIntroDone, setUnrealIntroDone] = useState(() => localStorage.getItem('evilpin-unreal-intro-complete') === '1')
  const [actorDone, setActorDone] = useState(() => localStorage.getItem('evilpin-actor-complete') === '1')
  const [beginPlayDone, setBeginPlayDone] = useState(() => localStorage.getItem('evilpin-beginplay-complete') === '1')
  const [tickDone, setTickDone] = useState(() => localStorage.getItem('evilpin-tick-complete') === '1')
  const [componentsDone, setComponentsDone] = useState(() => localStorage.getItem('evilpin-components-complete') === '1')
  const [collisionDone, setCollisionDone] = useState(() => localStorage.getItem('evilpin-collision-complete') === '1')
  const [timerDone, setTimerDone] = useState(() => localStorage.getItem('evilpin-timer-complete') === '1')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const toastIdRef = useRef(0)

  const lineCount = useMemo(() => code.split('\n').length, [code])
  const progressBySlide = [12, 25, 38, 54, 70, 86, 96]
  const lessonProgress = quizSolved ? 100 : progressBySlide[activeSlide]
  const completedLessons = [
    quizSolved,
    lessonTwoDone,
    lessonThreeDone,
    lessonFourDone,
    lessonFiveDone,
    lessonSixDone,
    lessonSevenDone,
    boolDone,
    parametersDone,
    arraysDone,
    classesDone,
    unrealIntroDone,
    actorDone,
    beginPlayDone,
    tickDone,
    componentsDone,
    collisionDone,
    timerDone,
  ].filter(Boolean).length
  const courseProgress = Math.round((completedLessons / 18) * 100)

  const canOpenSlide = (index: number) => {
    if (index <= 1) return true
    if (index <= 3) return warmupSolved
    if (index === 4) return assemblySolved
    if (index === 5) return completed
    return reinforcementSolved
  }

  useEffect(() => {
    localStorage.setItem('evilpin-xp', String(xp))
  }, [xp])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const addToast = (message: string, tone: Toast['tone'] = 'info') => {
    toastIdRef.current += 1
    const id = toastIdRef.current
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }

  const goToSlide = (next: number) => {
    if (next < 0 || next > slides.length - 1) return
    if (!canOpenSlide(next)) {
      if (!warmupSolved) {
        addToast('Сначала выбери правильный ответ', 'info')
        setActiveSlide(1)
      } else if (!assemblySolved) {
        addToast('Сначала собери строку из кусочков', 'info')
        setActiveSlide(3)
      } else if (!completed) {
        addToast('Сначала измени число в редакторе', 'info')
        setActiveSlide(4)
      } else {
        addToast('Сначала выполни задание на закрепление', 'info')
        setActiveSlide(5)
      }
      return
    }
    setActiveSlide(next)
  }

  const runCode = () => {
    if (runStatus === 'running') return
    setRunStatus('running')
    setConsoleLines(['> Смотрим, что получилось...'])

    timerRef.current = window.setTimeout(() => {
      const hasTenCoins = /int\s+coins\s*=\s*10\s*;/.test(code)

      if (hasTenCoins) {
        setRunStatus('success')
        setConsoleLines([
          '✓ Всё правильно!',
          'coins = 10',
          'Герой получил 10 монет.',
        ])
        if (!completed) {
          setCompleted(true)
          localStorage.setItem('evilpin-number-v2-done', '1')
          setXp((value) => value + 10)
          addToast('+10 XP · Первое задание готово', 'success')
        } else {
          addToast('Правильно — в coins лежит число 10', 'success')
        }
      } else {
        setRunStatus('error')
        setConsoleLines([
          'Пока не 10. Ничего страшного!',
          'Найди число 0 и замени его на 10.',
          'Остальные части строки не трогай.',
        ])
      }
    }, 650)
  }

  const insertSolution = () => {
    if (/int\s+coins\s*=\s*10\s*;/.test(code)) {
      setHintOpen(false)
      addToast('В coins уже лежит число 10')
      return
    }
    setCode(solvedLine)
    setRunStatus('idle')
    setHintOpen(false)
    addToast('Готово: 0 заменён на 10')
  }

  const resetCode = () => {
    setCode(initialCode)
    setRunStatus('idle')
    setConsoleLines(['Начинаем заново.', 'Замени 0 на 10.'])
  }

  const copyLine = async () => {
    await navigator.clipboard.writeText(solvedLine.trim())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const answerWarmup = (index: number) => {
    setWarmupAnswer(index)
    if (index === 1 && !warmupSolved) {
      setWarmupSolved(true)
      localStorage.setItem('evilpin-number-v2-choice-done', '1')
      setXp((value) => value + 5)
      addToast('+5 XP · Правильный выбор', 'success')
    }
  }

  const addCodePiece = (piece: string) => {
    if (assemblySolved) return
    setTokenBank((current) => current.filter((token) => token !== piece))
    setCodePieces((current) => [...current, piece])
    setAssemblyError(false)
  }

  const removeCodePiece = (piece: string) => {
    if (assemblySolved) return
    setCodePieces((current) => current.filter((token) => token !== piece))
    setTokenBank((current) => [...current, piece])
    setAssemblyError(false)
  }

  const resetAssembly = () => {
    if (assemblySolved) return
    setTokenBank(shuffledCodePieces)
    setCodePieces([])
    setAssemblyError(false)
  }

  const checkAssembly = () => {
    const isCorrect = codePieces.join(' ') === correctCodePieces.join(' ')
    if (isCorrect) {
      if (!assemblySolved) {
        setAssemblySolved(true)
        localStorage.setItem('evilpin-number-v2-assembly-done', '1')
        setXp((value) => value + 5)
        addToast('+5 XP · Строка собрана', 'success')
      }
      setAssemblyError(false)
    } else {
      setAssemblyError(true)
    }
  }

  const checkReinforcement = () => {
    const isCorrect = /int\s+gems\s*=\s*5\s*;/.test(reinforcementCode)
    if (isCorrect) {
      if (!reinforcementSolved) {
        localStorage.setItem('evilpin-number-v3-reinforcement-done', '1')
        setXp((value) => value + 10)
        addToast('+10 XP · Навык закреплён', 'success')
      }
      setReinforcementStatus('success')
    } else {
      setReinforcementStatus('error')
    }
  }

  const answerQuiz = (index: number) => {
    setSelectedAnswer(index)
    if (index === 1 && !quizSolved) {
      setQuizSolved(true)
      localStorage.setItem('evilpin-number-v3-quiz-done', '1')
      setXp((value) => value + 10)
      addToast('+10 XP · Первый урок завершён', 'success')
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar glass-panel">
        <button
          className="icon-button mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Открыть программу курса"
          title="Программа курса"
        >
          <Menu size={19} />
        </button>

        <a className="brand" href="#top" aria-label="EvilPin — на главную">
          <span className="brand-mark"><Hexagon size={19} strokeWidth={2.4} /></span>
          <span className="brand-name">EVILPIN</span>
          <span className="brand-divider" />
          <span className="brand-course">C++ · С абсолютного нуля</span>
        </a>

        <div className="top-stats">
          <button className="stat-pill" title="Серия дней">
            <Flame size={17} fill="currentColor" />
            <strong>1</strong><span className="stat-label">день</span>
          </button>
          <button className="stat-pill xp-pill" title="Очки опыта">
            <Zap size={17} fill="currentColor" />
            <strong>{xp}</strong><span className="stat-label">XP</span>
          </button>
          <button className="stat-pill hearts-pill" title="Доступные попытки">
            <Heart size={17} fill="currentColor" />
            <strong>5</strong>
          </button>
          <button className="profile-button" aria-label="Профиль ученика" title="Профиль">
            <span>AK</span>
            <i className="online-dot" />
          </button>
        </div>
      </header>

      <aside className={`course-sidebar glass-panel ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <div>
            <span className="eyebrow">ТВОЙ МАРШРУТ</span>
            <h2>C++ для новичка</h2>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Закрыть программу"
            title="Закрыть"
          >
            <X size={19} />
          </button>
        </div>

        <div className="course-overview">
          <div className="overview-copy">
            <span>Прогресс курса</span>
            <strong>{courseProgress}%</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${courseProgress}%` }} /></div>
        </div>

        <nav className="lesson-map" aria-label="Уроки курса">
          {lessonGroups.map((group, groupIndex) => (
            <section className="lesson-group" key={group.chapter}>
              <div className="group-title">
                <span>{group.chapter}</span>
                <p>{group.title}</p>
              </div>
              <div className="lesson-list">
                {group.lessons.map((lesson, lessonIndex) => {
                  let lessonState: string = lesson.state
                  if (groupIndex === 0 && lessonIndex === 0) {
                    lessonState = currentLesson === 0 ? (quizSolved ? 'done' : 'active') : quizSolved ? 'done' : 'locked'
                  }
                  if (groupIndex === 0 && lessonIndex === 1) {
                    lessonState = currentLesson === 1 ? (lessonTwoDone ? 'done' : 'active') : quizSolved ? 'next' : 'locked'
                  }
                  if (groupIndex === 0 && lessonIndex === 2) {
                    lessonState = currentLesson === 2 ? (lessonThreeDone ? 'done' : 'active') : lessonTwoDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 0 && lessonIndex === 3) {
                    lessonState = currentLesson === 3 ? (lessonFourDone ? 'done' : 'active') : lessonThreeDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 1 && lessonIndex === 0) {
                    lessonState = currentLesson === 4 ? (lessonFiveDone ? 'done' : 'active') : lessonFourDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 1 && lessonIndex === 1) {
                    lessonState = currentLesson === 5 ? (lessonSixDone ? 'done' : 'active') : lessonFiveDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 1 && lessonIndex === 2) {
                    lessonState = currentLesson === 6 ? (lessonSevenDone ? 'done' : 'active') : lessonSixDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 2 && lessonIndex === 0) {
                    lessonState = currentLesson === 7 ? (boolDone ? 'done' : 'active') : lessonSevenDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 2 && lessonIndex === 1) {
                    lessonState = currentLesson === 8 ? (parametersDone ? 'done' : 'active') : boolDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 2 && lessonIndex === 2) {
                    lessonState = currentLesson === 9 ? (arraysDone ? 'done' : 'active') : parametersDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 2 && lessonIndex === 3) {
                    lessonState = currentLesson === 10 ? (classesDone ? 'done' : 'active') : arraysDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 3 && lessonIndex === 0) {
                    lessonState = currentLesson === 11 ? (unrealIntroDone ? 'done' : 'active') : classesDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 3 && lessonIndex === 1) {
                    lessonState = currentLesson === 12 ? (actorDone ? 'done' : 'active') : unrealIntroDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 3 && lessonIndex === 2) {
                    lessonState = currentLesson === 13 ? (beginPlayDone ? 'done' : 'active') : actorDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 4 && lessonIndex === 0) {
                    lessonState = currentLesson === 14 ? (tickDone ? 'done' : 'active') : beginPlayDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 4 && lessonIndex === 1) {
                    lessonState = currentLesson === 15 ? (componentsDone ? 'done' : 'active') : tickDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 4 && lessonIndex === 2) {
                    lessonState = currentLesson === 16 ? (collisionDone ? 'done' : 'active') : componentsDone ? 'next' : 'locked'
                  }
                  if (groupIndex === 4 && lessonIndex === 3) {
                    lessonState = currentLesson === 17 ? (timerDone ? 'done' : 'active') : collisionDone ? 'next' : 'locked'
                  }
                  if (lessonState === 'locked') lessonState = 'available'
                  return (
                    <button
                      key={lesson.title}
                      className={`lesson-item ${lessonState}`}
                      disabled={lessonState === 'locked'}
                      onClick={() => {
                        const targetLesson = (lessonOffsets[groupIndex] + lessonIndex) as CourseLessonIndex
                        setSidebarOpen(false)
                        setCurrentLesson(targetLesson)
                        if (targetLesson === 0) setActiveSlide(0)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <span className="lesson-node">
                        {lessonState === 'done' ? <Check size={15} /> : lessonState === 'locked' ? <LockKeyhole size={13} /> : <Play size={13} fill="currentColor" />}
                      </span>
                      <span className="lesson-text">
                        <strong>{lesson.title}</strong>
                        <small>{lessonState === 'next' ? 'Открыт · следующий' : lessonState === 'available' ? `${lesson.meta} · тест` : lesson.meta}</small>
                      </span>
                      {(lessonState === 'active' || lessonState === 'next') && <span className="active-ping" />}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="sidebar-foot testing-mode-note">
          <Sparkles size={17} />
          <p><strong>Тестовый режим</strong><span>Все 18 уроков временно открыты</span></p>
        </div>
      </aside>

      {sidebarOpen && <button className="page-scrim" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню" />}

      <main className="lesson-workspace" id="top">
        {currentLesson === 0 ? <>
        <section className="lesson-header">
          <div className="lesson-title-wrap">
            <span className="lesson-kicker"><span>УРОК 1</span><i /> САМОЕ НАЧАЛО</span>
            <h1>Меняем первое число</h1>
            <p>Одна строка C++. Без сложных слов и лишней теории.</p>
          </div>
          <div className="lesson-meta">
            <span><Clock3 size={15} /> 5 минут</span>
            <span><Zap size={15} /> +40 XP</span>
          </div>
        </section>

        <div className="lesson-progress-row">
          <div className="lesson-progress-track">
            <span style={{ width: `${lessonProgress}%` }} />
          </div>
          <strong>{lessonProgress}%</strong>
        </div>

        <nav className="slide-tabs" aria-label="Этапы урока">
          {slides.map((slide, index) => {
            const isAvailable = canOpenSlide(index)
            const isPassed = index < activeSlide
              || (index === 1 && warmupSolved)
              || (index === 3 && assemblySolved)
              || (index === 4 && completed)
              || (index === 5 && reinforcementSolved)
              || (index === 6 && quizSolved)
            return (
              <button
                key={slide.label}
                className={`${index === activeSlide ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => isAvailable && goToSlide(index)}
                disabled={!isAvailable}
              >
                <span>{isPassed ? <Check size={14} /> : slide.short}</span>
                {slide.label}
              </button>
            )
          })}
        </nav>

        <section className="slide-stage glass-panel">
          {activeSlide === 0 && (
            <div className="slide-content mission-slide slide-enter">
              <div className="mission-copy">
                <span className="section-tag"><BookOpen size={15} /> ТЕОРИЯ · 30 СЕКУНД</span>
                <h2>Код хранит<br />числа</h2>
                <p className="lead">Компьютер запоминает число и использует его в игре. Например, сколько монет есть у героя.</p>
                <div className="mission-checklist">
                  <div><span><Code2 size={14} /></span><p><strong><code>int coins = 0;</code></strong><small>Так выглядит одна строка C++</small></p></div>
                  <div><span><Check size={14} /></span><p><strong>coins — название</strong><small>По-английски означает «монеты»</small></p></div>
                  <div><span><Check size={14} /></span><p><strong>0 — количество</strong><small>Число можно изменить</small></p></div>
                </div>
                <div className="slide-actions">
                  <button className="primary-button" onClick={() => goToSlide(1)}>
                    Ответить на вопрос <ArrowRight size={17} />
                  </button>
                  <button className="text-button" onClick={() => setExplanationOpen(true)}>
                    <CircleHelp size={17} /> Что вообще такое код?
                  </button>
                </div>
              </div>

              <div className="scene-card">
                <div className="scene-toolbar">
                  <span><i /> <i /> <i /></span>
                  <small>PLAYER_PREVIEW</small>
                  <Gauge size={16} />
                </div>
                <div className="scene-grid coin-scene">
                  <div className="scene-orbit orbit-one" />
                  <div className="scene-orbit orbit-two" />
                  <div className="coin-visual">
                    {[0, 1, 2, 3, 4].map((coin) => <span key={coin} style={{ '--i': coin } as React.CSSProperties}><Gem size={18} /></span>)}
                  </div>
                  <div className="player-beacon"><Bot size={18} /><i /></div>
                  <div className="timer-beacon coin-counter"><Gem size={16} /><strong>coins = 10</strong></div>
                  <div className="axis-gizmo"><span>C</span><span>+</span><span>+</span></div>
                </div>
                <div className="scene-caption">
                  <span className="pulse-dot" />
                  <p><strong>Счётчик монет</strong><small>Сейчас у героя будет 10</small></p>
                  <code>0 → 10</code>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 1 && (
            <div className="slide-content choice-slide slide-enter">
              <div className="choice-card">
                <span className="section-tag"><Target size={15} /> ВЫБЕРИ ОТВЕТ</span>
                <h2>Что нужно изменить,<br />чтобы монет стало 10?</h2>
                <div className="choice-code"><code>int coins = <mark>0</mark>;</code></div>
                <div className="answer-list choice-answers">
                  {['Слово int', 'Число 0', 'Слово coins'].map((answer, index) => {
                    const showResult = warmupAnswer === index || (warmupSolved && index === 1)
                    return (
                      <button
                        key={answer}
                        className={`${warmupAnswer === index ? 'selected' : ''} ${showResult ? (index === 1 ? 'correct' : 'wrong') : ''}`}
                        onClick={() => answerWarmup(index)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <p>{answer}</p>
                        {showResult && (index === 1 ? <CheckCircle2 size={20} /> : <X size={20} />)}
                      </button>
                    )
                  })}
                </div>
                {warmupAnswer !== null && (
                  <div className={`answer-feedback ${warmupAnswer === 1 ? 'correct' : 'wrong'}`}>
                    {warmupAnswer === 1 ? <CheckCircle2 size={20} /> : <RefreshCw size={19} />}
                    <p>
                      <strong>{warmupAnswer === 1 ? 'Точно!' : 'Почти. Попробуй ещё раз'}</strong>
                      <span>{warmupAnswer === 1 ? 'Меняем только 0. Остальная строка уже готова.' : 'Нужная часть подсвечена фиолетовым.'}</span>
                    </p>
                  </div>
                )}
                <button className="primary-button choice-next" disabled={!warmupSolved} onClick={() => goToSlide(2)}>
                  Дальше <ArrowRight size={17} />
                </button>
              </div>
              <aside className="choice-side-note">
                <div className="side-note-icon"><Heart size={22} fill="currentColor" /></div>
                <strong>Можно ошибаться</strong>
                <p>В учебных заданиях EvilPin попытки не заканчиваются.</p>
              </aside>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="slide-content concept-slide slide-enter">
              <div className="concept-heading">
                <div>
                  <span className="section-tag"><Zap size={15} /> РАЗБИРАЕМ СТРОКУ</span>
                  <h2>Код — это команда для компьютера</h2>
                  <p className="lead">Он читает строку слева направо. Разберём её по трём простым частям.</p>
                </div>
                <button className="explain-button" onClick={() => setExplanationOpen(true)}>
                  <CircleHelp size={18} /> Объяснить проще
                </button>
              </div>

              <div className="flow-diagram">
                <div className="flow-card">
                  <span className="flow-number">01</span>
                  <div className="flow-icon blue"><Code2 size={20} /></div>
                  <p><strong>int</strong><small>Будет целое число</small></p>
                </div>
                <div className="flow-link"><i /><ChevronRight size={18} /></div>
                <div className="flow-card featured">
                  <span className="flow-number">02</span>
                  <div className="flow-icon violet"><Bot size={21} /></div>
                  <p><strong>coins</strong><small>Назовём его «монеты»</small></p>
                  <span className="mini-badge">ИМЯ</span>
                </div>
                <div className="flow-link"><i /><ChevronRight size={18} /></div>
                <div className="flow-card">
                  <span className="flow-number">03</span>
                  <div className="flow-icon mint"><Gem size={20} /></div>
                  <p><strong>10</strong><small>Столько будет монет</small></p>
                </div>
              </div>

              <div className="syntax-strip">
                <div className="syntax-label"><Code2 size={16} /><span>Вся строка</span></div>
                <code><em>int</em> <b>coins</b> = 10;</code>
                <button onClick={copyLine} className="icon-button" title="Скопировать строку" aria-label="Скопировать строку">
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>

              <div className="concept-bottom">
                <div className="remember-note"><Lightbulb size={19} /><p><strong>Сегодня запомни только это:</strong> число справа показывает, сколько монет хранит программа.</p></div>
                <button className="primary-button" onClick={() => goToSlide(3)}>Собрать строку <Puzzle size={17} /></button>
              </div>
            </div>
          )}

          {activeSlide === 3 && (
            <div className="slide-content assembly-slide slide-enter">
              <div className="assembly-heading">
                <div>
                  <span className="section-tag"><Puzzle size={15} /> СОБЕРИ КОД</span>
                  <h2>Поставь кусочки<br />в правильном порядке</h2>
                  <p className="lead">Нажимай на карточки. Они будут вставляться слева направо.</p>
                </div>
                <button className="icon-button" onClick={resetAssembly} disabled={assemblySolved} aria-label="Собрать заново" title="Собрать заново">
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className={`assembly-workbench ${assemblyError ? 'has-error' : ''} ${assemblySolved ? 'is-solved' : ''}`}>
                <span className="workbench-label">ТВОЯ СТРОКА</span>
                <div className="assembly-slots">
                  {codePieces.map((piece) => (
                    <button key={piece} onClick={() => removeCodePiece(piece)} disabled={assemblySolved} className={`code-piece piece-${piece === ';' ? 'end' : piece}`}>
                      {piece}
                    </button>
                  ))}
                  {Array.from({ length: 5 - codePieces.length }, (_, index) => <span className="empty-code-slot" key={index} />)}
                </div>
                {assemblySolved && <div className="assembly-success"><CheckCircle2 size={18} /> Отлично! Это настоящая строка C++.</div>}
                {assemblyError && <div className="assembly-error"><RefreshCw size={17} /> Порядок пока другой. Можно нажать на кусочек и вернуть его вниз.</div>}
              </div>

              <div className="token-bank">
                <span className="workbench-label">КУСОЧКИ</span>
                <div>
                  {tokenBank.map((piece) => (
                    <button key={piece} onClick={() => addCodePiece(piece)} className={`code-piece piece-${piece === ';' ? 'end' : piece}`}>
                      {piece}
                    </button>
                  ))}
                  {tokenBank.length === 0 && <span className="bank-empty">Все кусочки наверху</span>}
                </div>
              </div>

              <div className="assembly-footer">
                <p><Lightbulb size={17} /> Начни с <code>int</code>, закончи точкой с запятой <code>;</code></p>
                <div>
                  {!assemblySolved && <button className="secondary-button" onClick={resetAssembly}><RotateCcw size={15} /> Сбросить</button>}
                  <button className="primary-button" disabled={codePieces.length < 5 || assemblySolved} onClick={checkAssembly}>
                    Проверить порядок <Check size={17} />
                  </button>
                  {assemblySolved && <button className="primary-button" onClick={() => goToSlide(4)}>Попробовать самому <ArrowRight size={17} /></button>}
                </div>
              </div>
            </div>
          )}

          {activeSlide === 4 && (
            <div className="slide-content practice-slide slide-enter">
              <div className="task-bar">
                <div className="task-copy">
                  <span className="task-number">ЗАДАЧА 1/1</span>
                  <p>Найди <code>int coins = 0;</code> и замени <strong>0</strong> на <strong>10</strong>.</p>
                </div>
                <div className="task-tools">
                  {completed && <span className="done-chip"><CheckCircle2 size={15} /> Выполнено</span>}
                  <button className={`hint-button ${hintOpen ? 'active' : ''}`} onClick={() => setHintOpen(!hintOpen)}>
                    <Lightbulb size={17} /> Подсказка
                  </button>
                </div>
              </div>

              <div className="lab-grid">
                <div className="editor-pane">
                  <div className="pane-header">
                    <div className="file-tab"><Code2 size={15} /><span>Урок1.cpp</span><i /></div>
                    <div className="pane-actions">
                      <button className="icon-button" onClick={resetCode} aria-label="Сбросить код" title="Сбросить код"><RotateCcw size={15} /></button>
                    </div>
                  </div>
                  <div className="editor-body">
                    <div className="line-numbers" aria-hidden="true">
                      {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
                    </div>
                    <textarea
                      aria-label="Редактор кода C++"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value)
                        setRunStatus('idle')
                      }}
                      onKeyDown={(event) => {
                        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                          event.preventDefault()
                          runCode()
                        }
                      }}
                      spellCheck={false}
                    />
                  </div>
                  <div className="editor-status">
                    <span><span className="status-dot" /> C++</span>
                    <span>UTF-8</span>
                    <span>Ln {lineCount}, Col 1</span>
                  </div>
                </div>

                <div className="console-pane">
                  <div className="pane-header">
                    <div className="console-title"><Terminal size={15} /><span>Результат</span></div>
                    <span className={`runtime-state ${runStatus}`}>{runStatus === 'running' ? 'BUILDING' : runStatus === 'success' ? 'PASSED' : runStatus === 'error' ? 'ERROR' : 'READY'}</span>
                  </div>
                  <div className={`runtime-preview ${runStatus}`}>
                    <div className="mini-scene-grid" />
                    <div className={`mini-coins ${runStatus === 'success' ? 'filled' : ''}`}>
                      <span><Gem size={14} /></span><span><Gem size={14} /></span><span><Gem size={14} /></span>
                    </div>
                    <div className="mini-player"><Bot size={16} /></div>
                    <div className={`mini-score ${runStatus === 'success' ? 'filled' : ''}`}><Gem size={12} /> {runStatus === 'success' ? '10' : '0'}</div>
                    {runStatus === 'running' && <div className="scan-line" />}
                    {runStatus === 'success' && <div className="success-burst"><Sparkles size={24} /></div>}
                    <span className="camera-label">PROGRAM OUTPUT</span>
                  </div>
                  <div className="terminal-output" aria-live="polite">
                    {consoleLines.map((line, index) => (
                      <p key={`${line}-${index}`} className={line.startsWith('✓') ? 'log-success' : line.startsWith('✕') || line.startsWith('error') ? 'log-error' : ''}>
                        <span>{String(index + 1).padStart(2, '0')}</span>{line}
                      </p>
                    ))}
                    {runStatus === 'running' && <p className="typing-line"><span>03</span><i /><i /><i /></p>}
                  </div>
                </div>
              </div>

              {hintOpen && (
                <div className="hint-popover">
                  <div className="hint-icon"><Lightbulb size={20} /></div>
                  <div>
                    <strong>Посмотри на строку 1</strong>
                    <p>Найди <code>0</code> после знака <code>=</code> и напиши вместо него <code>10</code>. Больше ничего менять не нужно.</p>
                  </div>
                  <button onClick={insertSolution}>Показать решение</button>
                  <button className="icon-button hint-close" onClick={() => setHintOpen(false)} aria-label="Закрыть подсказку" title="Закрыть"><X size={16} /></button>
                </div>
              )}

              <div className="lab-footer">
                <p><kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd><span>запустить код</span></p>
                <div>
                  {completed && <button className="secondary-button" onClick={() => setExplanationOpen(true)}><BookOpen size={16} /> Разбор</button>}
                  <button className={`run-button ${runStatus}`} onClick={runCode}>
                    {runStatus === 'running' ? <RefreshCw className="spin" size={17} /> : runStatus === 'success' ? <Check size={18} /> : <Play size={17} fill="currentColor" />}
                    {runStatus === 'running' ? 'Собираем...' : runStatus === 'success' ? 'Запустить ещё раз' : 'Проверить код'}
                  </button>
                  {completed && <button className="next-icon-button" onClick={() => goToSlide(5)} aria-label="Перейти к закреплению" title="К закреплению"><ArrowRight size={19} /></button>}
                </div>
              </div>
            </div>
          )}

          {activeSlide === 5 && (
            <div className="slide-content reinforcement-slide slide-enter">
              <div className="reinforcement-card">
                <span className="section-tag"><Gauge size={15} /> ЗАКРЕПЛЯЕМ</span>
                <h2>Теперь без подсказки:<br />дай герою 5 кристаллов</h2>
                <p className="lead">Мы поменяли название с <code>coins</code> на <code>gems</code>. Твоя задача та же — изменить число.</p>

                <div className={`single-line-editor ${reinforcementStatus}`}>
                  <div className="single-line-head"><Code2 size={15} /><span>Задание2.cpp</span><small>строка 1</small></div>
                  <div className="single-line-body">
                    <span>1</span>
                    <input
                      value={reinforcementCode}
                      onChange={(event) => { setReinforcementCode(event.target.value); setReinforcementStatus('idle') }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          checkReinforcement()
                        }
                      }}
                      aria-label="Код для задания на закрепление"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {reinforcementStatus === 'success' && (
                  <div className="reinforcement-feedback success"><CheckCircle2 size={20} /><p><strong>Получилось!</strong><span>Ты применил то же правило с новым названием.</span></p></div>
                )}
                {reinforcementStatus === 'error' && (
                  <div className="reinforcement-feedback error"><Lightbulb size={20} /><p><strong>Проверь число справа</strong><span>Готовая строка должна закончиться так: <code>= 5;</code></span></p></div>
                )}

                <div className="reinforcement-actions">
                  <button className={`run-button ${reinforcementStatus}`} onClick={checkReinforcement}>
                    {reinforcementStatus === 'success' ? <Check size={17} /> : <Play size={16} fill="currentColor" />}
                    {reinforcementStatus === 'success' ? 'Выполнено' : 'Проверить'}
                  </button>
                  {reinforcementSolved && <button className="primary-button" onClick={() => goToSlide(6)}>Завершить урок <ArrowRight size={17} /></button>}
                </div>
              </div>
              <aside className="transfer-card">
                <span>БЫЛО</span>
                <code>int coins = 10;</code>
                <ArrowRight size={18} />
                <span>СТАЛО</span>
                <code>int gems = 5;</code>
                <p>Одно правило работает с разными игровыми данными.</p>
              </aside>
            </div>
          )}

          {activeSlide === 6 && (
            <div className="slide-content quiz-slide slide-enter">
              <div className="quiz-card">
                <div className={`quiz-celebration ${quizSolved ? 'show' : ''}`}><Sparkles size={21} /> УРОК ПОЧТИ ГОТОВ</div>
                <span className="section-tag"><Trophy size={15} /> БЫСТРАЯ ПРОВЕРКА</span>
                <h2>Какое число теперь<br />хранится в <code>coins</code>?</h2>
                <p className="lead">Посмотри на готовую строку и выбери ответ.</p>
                <div className="answer-list">
                  {[
                    '0 монет',
                    '10 монет',
                    '100 монет',
                  ].map((answer, index) => {
                    const isCorrect = index === 1
                    const showResult = selectedAnswer === index || (quizSolved && isCorrect)
                    return (
                      <button
                        key={answer}
                        className={`${selectedAnswer === index ? 'selected' : ''} ${showResult ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                        onClick={() => answerQuiz(index)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <p>{answer}</p>
                        {showResult && (isCorrect ? <CheckCircle2 size={20} /> : <X size={20} />)}
                      </button>
                    )
                  })}
                </div>
                {selectedAnswer !== null && (
                  <div className={`answer-feedback ${selectedAnswer === 1 ? 'correct' : 'wrong'}`}>
                    {selectedAnswer === 1 ? <CheckCircle2 size={20} /> : <RefreshCw size={19} />}
                    <p><strong>{selectedAnswer === 1 ? 'Верно!' : 'Попробуй ещё раз'}</strong><span>{selectedAnswer === 1 ? 'Число справа от знака = теперь равно 10.' : 'Посмотри на число после знака =.'}</span></p>
                  </div>
                )}
              </div>

              <aside className="lesson-summary">
                <div className="summary-icon"><Gem size={28} /></div>
                <span>РЕЗУЛЬТАТ УРОКА</span>
                <h3>{quizSolved ? 'Первый шаг готов!' : 'Остался один ответ'}</h3>
                <div className="summary-xp"><Zap size={20} fill="currentColor" /><strong>{quizSolved ? '+40' : '+30'}</strong><span>XP получено</span></div>
                <div className="summary-list">
                  <p><Check size={15} /> Нашёл число в коде</p>
                  <p><Check size={15} /> Изменил 0 на 10</p>
                  <p className={quizSolved ? '' : 'muted'}>{quizSolved ? <Check size={15} /> : <LockKeyhole size={14} />} Проверил результат</p>
                </div>
                <button className="primary-button" disabled={!quizSolved} onClick={() => { setCurrentLesson(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                  Начать урок 2 <ArrowRight size={17} />
                </button>
              </aside>
            </div>
          )}
        </section>

        <div className="lesson-navigation">
          <button className="nav-button" disabled={activeSlide === 0} onClick={() => goToSlide(activeSlide - 1)}>
            <ChevronLeft size={18} /> Назад
          </button>
          <span>{activeSlide + 1} / {slides.length}</span>
          <button className="nav-button" disabled={activeSlide === slides.length - 1 || !canOpenSlide(activeSlide + 1)} onClick={() => goToSlide(activeSlide + 1)}>
            Далее <ChevronRight size={18} />
          </button>
        </div>
        </> : currentLesson === 1 ? (
          <LessonTwo
            onXp={(points) => setXp((value) => value + points)}
            notify={addToast}
            onComplete={() => setLessonTwoDone(true)}
            onNext={() => setCurrentLesson(2)}
          />
        ) : (
          <ProgressiveLesson
            key={advancedLessons[currentLesson - 2].id}
            config={advancedLessons[currentLesson - 2]}
            onXp={(points) => setXp((value) => value + points)}
            notify={addToast}
            onComplete={() => {
              if (currentLesson === 2) setLessonThreeDone(true)
              if (currentLesson === 3) setLessonFourDone(true)
              if (currentLesson === 4) setLessonFiveDone(true)
              if (currentLesson === 5) setLessonSixDone(true)
              if (currentLesson === 6) setLessonSevenDone(true)
              if (currentLesson === 7) setBoolDone(true)
              if (currentLesson === 8) setParametersDone(true)
              if (currentLesson === 9) setArraysDone(true)
              if (currentLesson === 10) setClassesDone(true)
              if (currentLesson === 11) setUnrealIntroDone(true)
              if (currentLesson === 12) setActorDone(true)
              if (currentLesson === 13) setBeginPlayDone(true)
              if (currentLesson === 14) setTickDone(true)
              if (currentLesson === 15) setComponentsDone(true)
              if (currentLesson === 16) setCollisionDone(true)
              if (currentLesson === 17) setTimerDone(true)
            }}
            onNext={currentLesson < 17 ? () => {
              if (currentLesson === 2) setCurrentLesson(3)
              if (currentLesson === 3) setCurrentLesson(4)
              if (currentLesson === 4) setCurrentLesson(5)
              if (currentLesson === 5) setCurrentLesson(6)
              if (currentLesson === 6) setCurrentLesson(7)
              if (currentLesson === 7) setCurrentLesson(8)
              if (currentLesson === 8) setCurrentLesson(9)
              if (currentLesson === 9) setCurrentLesson(10)
              if (currentLesson === 10) setCurrentLesson(11)
              if (currentLesson === 11) setCurrentLesson(12)
              if (currentLesson === 12) setCurrentLesson(13)
              if (currentLesson === 13) setCurrentLesson(14)
              if (currentLesson === 14) setCurrentLesson(15)
              if (currentLesson === 15) setCurrentLesson(16)
              if (currentLesson === 16) setCurrentLesson(17)
            } : undefined}
          />
        )}
      </main>

      {explanationOpen && currentLesson === 0 && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setExplanationOpen(false)}>
          <section className="explanation-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="explain-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-symbol"><CircleHelp size={22} /></div>
              <div><span>ОБЪЯСНЕНИЕ БЕЗ ВОДЫ</span><h2 id="explain-title">Представь коробку с наклейкой</h2></div>
              <button className="icon-button" onClick={() => setExplanationOpen(false)} aria-label="Закрыть объяснение" title="Закрыть"><X size={20} /></button>
            </div>
            <div className="analogy-card">
              <div className="analogy-step"><span>1</span><Code2 size={23} /><p><strong>Берём коробку</strong><small>Компьютер готов запомнить число</small></p></div>
              <ChevronRight size={18} />
              <div className="analogy-step"><span>2</span><Bot size={23} /><p><strong>Пишем «монеты»</strong><small>По-английски — coins</small></p></div>
              <ChevronRight size={18} />
              <div className="analogy-step"><span>3</span><Gem size={23} /><p><strong>Кладём число 10</strong><small>Готово — программа запомнила</small></p></div>
            </div>
            <div className="argument-list">
              <h3>Самое важное в строке</h3>
              <div><code>int</code><p><strong>Создать место для числа</strong><span>Пока просто оставь это слово как есть.</span></p></div>
              <div><code>coins</code><p><strong>Название «монеты»</strong><span>Так мы понимаем, что хранится внутри.</span></p></div>
              <div><code>= 10;</code><p><strong>Запомнить число 10</strong><span>Именно эту часть мы меняем сегодня.</span></p></div>
            </div>
            <div className="modal-footer">
              <p><Lightbulb size={17} /> Не нужно запоминать все слова. Сегодня достаточно найти и изменить число.</p>
              <button className="primary-button" onClick={() => { setExplanationOpen(false); goToSlide(warmupSolved ? 3 : 1) }}>Продолжить урок <ArrowRight size={17} /></button>
            </div>
          </section>
        </div>
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone}`}>
            {toast.tone === 'success' ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

type LessonTwoProps = {
  onXp: (points: number) => void
  notify: (message: string, tone?: Toast['tone']) => void
  onComplete: () => void
  onNext: () => void
}

const lessonTwoSlides = [
  'Теория',
  'Выбор',
  'Собираем',
  'Пишем',
  'Закрепляем',
  'Итог',
]

const lessonTwoTokens = ['100', 'health', 'int', ';', '=']
const lessonTwoCorrect = ['int', 'health', '=', '100', ';']

function LessonTwo({ onXp, notify, onComplete, onNext }: LessonTwoProps) {
  const [slide, setSlide] = useState(0)
  const [choiceAnswer, setChoiceAnswer] = useState<number | null>(null)
  const [choiceSolved, setChoiceSolved] = useState(() => localStorage.getItem('evilpin-names-choice') === '1')
  const [assemblySolved, setAssemblySolved] = useState(() => localStorage.getItem('evilpin-names-assembly') === '1')
  const [pieces, setPieces] = useState<string[]>(() => localStorage.getItem('evilpin-names-assembly') === '1' ? lessonTwoCorrect : [])
  const [bank, setBank] = useState<string[]>(() => localStorage.getItem('evilpin-names-assembly') === '1' ? [] : lessonTwoTokens)
  const [assemblyError, setAssemblyError] = useState(false)
  const [code, setCode] = useState(() => localStorage.getItem('evilpin-names-code') === '1' ? 'int health = 100;' : 'int x = 100;')
  const [codeStatus, setCodeStatus] = useState<RunStatus>(() => localStorage.getItem('evilpin-names-code') === '1' ? 'success' : 'idle')
  const [reinforcementAnswer, setReinforcementAnswer] = useState<number | null>(null)
  const [complete, setComplete] = useState(() => localStorage.getItem('evilpin-names-complete') === '1')

  const codeSolved = codeStatus === 'success'
  const progress = complete ? 100 : [15, 32, 50, 68, 86, 96][slide]

  const canOpen = (index: number) => {
    if (index <= 1) return true
    if (index === 2) return choiceSolved
    if (index === 3) return assemblySolved
    if (index === 4) return codeSolved
    return complete
  }

  const go = (index: number) => {
    if (index < 0 || index >= lessonTwoSlides.length) return
    if (canOpen(index)) setSlide(index)
  }

  const chooseName = (index: number) => {
    setChoiceAnswer(index)
    if (index === 2 && !choiceSolved) {
      setChoiceSolved(true)
      localStorage.setItem('evilpin-names-choice', '1')
      onXp(5)
      notify('+5 XP · Понятное имя выбрано', 'success')
    }
  }

  const addPiece = (piece: string) => {
    if (assemblySolved) return
    setBank((current) => current.filter((item) => item !== piece))
    setPieces((current) => [...current, piece])
    setAssemblyError(false)
  }

  const removePiece = (piece: string) => {
    if (assemblySolved) return
    setPieces((current) => current.filter((item) => item !== piece))
    setBank((current) => [...current, piece])
    setAssemblyError(false)
  }

  const resetPieces = () => {
    if (assemblySolved) return
    setPieces([])
    setBank(lessonTwoTokens)
    setAssemblyError(false)
  }

  const checkPieces = () => {
    if (pieces.join(' ') === lessonTwoCorrect.join(' ')) {
      if (!assemblySolved) {
        setAssemblySolved(true)
        localStorage.setItem('evilpin-names-assembly', '1')
        onXp(5)
        notify('+5 XP · Код собран', 'success')
      }
      setAssemblyError(false)
    } else {
      setAssemblyError(true)
    }
  }

  const checkCode = () => {
    if (/int\s+health\s*=\s*100\s*;/.test(code)) {
      if (!codeSolved) {
        localStorage.setItem('evilpin-names-code', '1')
        onXp(10)
        notify('+10 XP · Переменная переименована', 'success')
      }
      setCodeStatus('success')
    } else {
      setCodeStatus('error')
    }
  }

  const finishReinforcement = (index: number) => {
    setReinforcementAnswer(index)
    if (index === 1 && !complete) {
      setComplete(true)
      localStorage.setItem('evilpin-names-complete', '1')
      onXp(10)
      onComplete()
      notify('+10 XP · Урок 2 завершён', 'success')
    }
  }

  return (
    <>
      <section className="lesson-header">
        <div className="lesson-title-wrap">
          <span className="lesson-kicker"><span>УРОК 2</span><i /> САМОЕ НАЧАЛО</span>
          <h1>Даём данным имя</h1>
          <p>Учимся называть данные так, чтобы код было легко читать.</p>
        </div>
        <div className="lesson-meta">
          <span><Clock3 size={15} /> 6 минут</span>
          <span><Zap size={15} /> +30 XP</span>
        </div>
      </section>

      <div className="lesson-progress-row">
        <div className="lesson-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <strong>{progress}%</strong>
      </div>

      <nav className="slide-tabs" aria-label="Этапы второго урока">
        {lessonTwoSlides.map((label, index) => {
          const available = canOpen(index)
          const passed = index < slide
            || (index === 1 && choiceSolved)
            || (index === 2 && assemblySolved)
            || (index === 3 && codeSolved)
            || (index >= 4 && complete)
          return (
            <button key={label} className={`${slide === index ? 'active' : ''} ${passed ? 'passed' : ''}`} disabled={!available} onClick={() => go(index)}>
              <span>{passed ? <Check size={14} /> : `0${index + 1}`}</span>{label}
            </button>
          )
        })}
      </nav>

      <section className="slide-stage glass-panel">
        {slide === 0 && (
          <div className="slide-content name-theory-slide slide-enter">
            <div className="name-theory-copy">
              <span className="section-tag"><BookOpen size={15} /> ТЕОРИЯ · 30 СЕКУНД</span>
              <h2>Хорошее имя объясняет,<br />что лежит внутри</h2>
              <p className="lead">Компьютеру всё равно, как назвать число. Но человеку понятное имя помогает не запутаться.</p>
              <div className="name-compare">
                <div className="bad"><span>НЕПОНЯТНО</span><code>int x = 100;</code><p><X size={15} /> Что такое x?</p></div>
                <ArrowRight size={20} />
                <div className="good"><span>ПОНЯТНО</span><code>int health = 100;</code><p><Check size={15} /> Здоровье игрока</p></div>
              </div>
              <button className="primary-button" onClick={() => go(1)}>Ответить на вопрос <ArrowRight size={17} /></button>
            </div>
            <aside className="rule-card"><Lightbulb size={24} /><strong>Простое правило</strong><p>Имя пишем английскими буквами и без пробелов.</p><code>playerHealth</code></aside>
          </div>
        )}

        {slide === 1 && (
          <div className="slide-content choice-slide slide-enter">
            <div className="choice-card">
              <span className="section-tag"><Target size={15} /> ВЫБЕРИ ОТВЕТ</span>
              <h2>Как лучше назвать<br />здоровье игрока?</h2>
              <div className="answer-list choice-answers">
                {['x', 'zdorovie_igroka', 'health'].map((answer, index) => {
                  const show = choiceAnswer === index || (choiceSolved && index === 2)
                  return (
                    <button key={answer} className={`${show ? (index === 2 ? 'correct' : 'wrong') : ''}`} onClick={() => chooseName(index)}>
                      <span>{String.fromCharCode(65 + index)}</span><p><code>{answer}</code></p>
                      {show && (index === 2 ? <CheckCircle2 size={20} /> : <X size={20} />)}
                    </button>
                  )
                })}
              </div>
              {choiceAnswer !== null && <div className={`answer-feedback ${choiceAnswer === 2 ? 'correct' : 'wrong'}`}><p><strong>{choiceAnswer === 2 ? 'Верно!' : 'Попробуй другое имя'}</strong><span>{choiceAnswer === 2 ? 'Коротко, понятно и английскими буквами.' : 'Имя должно быть понятным и коротким.'}</span></p></div>}
              <button className="primary-button choice-next" disabled={!choiceSolved} onClick={() => go(2)}>Собрать код <Puzzle size={17} /></button>
            </div>
            <aside className="choice-side-note"><div className="side-note-icon"><Heart size={22} fill="currentColor" /></div><strong>Ошибки — это нормально</strong><p>Можно выбирать варианты сколько угодно раз.</p></aside>
          </div>
        )}

        {slide === 2 && (
          <div className="slide-content assembly-slide slide-enter">
            <div className="assembly-heading"><div><span className="section-tag"><Puzzle size={15} /> СОБЕРИ КОД</span><h2>Создай здоровье<br />со значением 100</h2><p className="lead">Нажимай на кусочки в правильном порядке.</p></div><button className="icon-button" onClick={resetPieces} disabled={assemblySolved} title="Собрать заново" aria-label="Собрать заново"><RotateCcw size={18} /></button></div>
            <div className={`assembly-workbench ${assemblyError ? 'has-error' : ''} ${assemblySolved ? 'is-solved' : ''}`}>
              <span className="workbench-label">ТВОЯ СТРОКА</span>
              <div className="assembly-slots">{pieces.map((piece) => <button key={piece} disabled={assemblySolved} onClick={() => removePiece(piece)} className="code-piece">{piece}</button>)}{Array.from({ length: 5 - pieces.length }, (_, index) => <span className="empty-code-slot" key={index} />)}</div>
              {assemblySolved && <div className="assembly-success"><CheckCircle2 size={18} /> Правильно: int health = 100;</div>}
              {assemblyError && <div className="assembly-error"><RefreshCw size={17} /> Попробуй изменить порядок.</div>}
            </div>
            <div className="token-bank"><span className="workbench-label">КУСОЧКИ</span><div>{bank.map((piece) => <button key={piece} onClick={() => addPiece(piece)} className="code-piece">{piece}</button>)}{bank.length === 0 && <span className="bank-empty">Все кусочки наверху</span>}</div></div>
            <div className="assembly-footer"><p><Lightbulb size={17} /> Начни с <code>int</code>, затем поставь имя.</p><div><button className="secondary-button" disabled={assemblySolved} onClick={resetPieces}><RotateCcw size={15} /> Сбросить</button><button className="primary-button" disabled={pieces.length < 5 || assemblySolved} onClick={checkPieces}>Проверить <Check size={17} /></button>{assemblySolved && <button className="primary-button" onClick={() => go(3)}>В редактор <ArrowRight size={17} /></button>}</div></div>
          </div>
        )}

        {slide === 3 && (
          <div className="slide-content reinforcement-slide slide-enter">
            <div className="reinforcement-card">
              <span className="section-tag"><Code2 size={15} /> ПРАКТИКА</span>
              <h2>Замени непонятное <code>x</code><br />на понятное <code>health</code></h2>
              <p className="lead">Число 100 и остальные части строки оставь без изменений.</p>
              <div className={`single-line-editor ${codeStatus}`}><div className="single-line-head"><Code2 size={15} /><span>Player.cpp</span><small>строка 1</small></div><div className="single-line-body"><span>1</span><input value={code} onChange={(event) => { setCode(event.target.value); setCodeStatus('idle') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); checkCode() } }} spellCheck={false} aria-label="Редактор имени переменной" /></div></div>
              {codeStatus === 'error' && <div className="reinforcement-feedback error"><Lightbulb size={20} /><p><strong>Замени только x</strong><span>Должно получиться: <code>int health = 100;</code></span></p></div>}
              {codeStatus === 'success' && <div className="reinforcement-feedback success"><CheckCircle2 size={20} /><p><strong>Отлично!</strong><span>Теперь строка сама объясняет, что хранит число.</span></p></div>}
              <div className="reinforcement-actions"><button className={`run-button ${codeStatus}`} onClick={checkCode}>{codeStatus === 'success' ? <Check size={17} /> : <Play size={16} fill="currentColor" />}{codeStatus === 'success' ? 'Выполнено' : 'Проверить'}</button>{codeSolved && <button className="primary-button" onClick={() => go(4)}>Закрепить <ArrowRight size={17} /></button>}</div>
            </div>
            <aside className="transfer-card"><span>БЫЛО</span><code>int x = 100;</code><ArrowRight size={18} /><span>СТАЛО</span><code>int health = 100;</code><p>Код работает так же, но читать его намного легче.</p></aside>
          </div>
        )}

        {slide === 4 && (
          <div className="slide-content choice-slide slide-enter">
            <div className="choice-card">
              <span className="section-tag"><Gauge size={15} /> ЗАКРЕПЛЯЕМ</span>
              <h2>Какая строка лучше<br />хранит количество жизней?</h2>
              <div className="answer-list choice-answers">
                {['int a = 3;', 'int lives = 3;', 'int zhizni igroka = 3;'].map((answer, index) => {
                  const show = reinforcementAnswer === index || (complete && index === 1)
                  return <button key={answer} className={show ? (index === 1 ? 'correct' : 'wrong') : ''} onClick={() => finishReinforcement(index)}><span>{String.fromCharCode(65 + index)}</span><p><code>{answer}</code></p>{show && (index === 1 ? <CheckCircle2 size={20} /> : <X size={20} />)}</button>
                })}
              </div>
              {reinforcementAnswer !== null && <div className={`answer-feedback ${reinforcementAnswer === 1 ? 'correct' : 'wrong'}`}><p><strong>{reinforcementAnswer === 1 ? 'Верно!' : 'Попробуй ещё раз'}</strong><span>{reinforcementAnswer === 1 ? 'lives — короткое и понятное имя.' : 'Нужны английские буквы, без пробелов и непонятных сокращений.'}</span></p></div>}
              <button className="primary-button choice-next" disabled={!complete} onClick={() => go(5)}>Результат <Trophy size={17} /></button>
            </div>
            <aside className="rule-card"><Lightbulb size={24} /><strong>Уже умеешь</strong><p>Ты выбрал имя, собрал строку и исправил код самостоятельно.</p></aside>
          </div>
        )}

        {slide === 5 && (
          <div className="slide-content lesson-two-finish slide-enter">
            <div className="finish-emblem"><Trophy size={34} /></div>
            <span className="section-tag"><Sparkles size={15} /> УРОК 2 ЗАВЕРШЁН</span>
            <h2>Теперь твой код<br />легко читать</h2>
            <p className="lead">Дальше научимся складывать числа и менять игровые значения.</p>
            <div className="finish-stats"><div><Zap size={19} /><strong>+30 XP</strong><span>за урок</span></div><div><CheckCircle2 size={19} /><strong>4 задания</strong><span>выполнено</span></div></div>
            <div className="summary-list"><p><Check size={15} /> Выбираешь понятные имена</p><p><Check size={15} /> Пишешь имена английскими буквами</p><p><Check size={15} /> Можешь исправить чужой код</p></div>
            <button className="primary-button finish-next" onClick={onNext}>Начать урок 3 <ArrowRight size={17} /></button>
          </div>
        )}
      </section>

      <div className="lesson-navigation">
        <button className="nav-button" disabled={slide === 0} onClick={() => go(slide - 1)}><ChevronLeft size={18} /> Назад</button>
        <span>{slide + 1} / {lessonTwoSlides.length}</span>
        <button className="nav-button" disabled={slide === lessonTwoSlides.length - 1 || !canOpen(slide + 1)} onClick={() => go(slide + 1)}>Далее <ChevronRight size={18} /></button>
      </div>
    </>
  )
}

type AdvancedLessonConfig = {
  id: string
  number: number
  title: string
  description: string
  duration: string
  xp: number
  theoryTitle: string
  theoryLead: string
  theoryExample: string
  theoryNotes: [string, string, string]
  choiceQuestion: string
  choiceCode: string
  choiceOptions: string[]
  correctChoice: number
  assemblyPrompt: string
  tokens: string[]
  correctTokens: string[]
  assemblyHint: string
  editorInstruction: string
  editorInitial: string
  editorTarget: string
  editorHint: string
  reinforcementQuestion: string
  reinforcementCode: string
  reinforcementOptions: string[]
  correctReinforcement: number
  finishTitle: string
  finishLead: string
  skills: string[]
  nextTitle?: string
}

const advancedLessons: AdvancedLessonConfig[] = [
  {
    id: 'math',
    number: 3,
    title: 'Складываем числа',
    description: 'Используем + и считаем игровые значения прямо в коде.',
    duration: '8 минут',
    xp: 40,
    theoryTitle: 'C++ умеет считать за нас',
    theoryLead: 'Знак + складывает числа. Сначала программа считает правую часть, затем запоминает результат.',
    theoryExample: 'int total = 10 + 5;',
    theoryNotes: ['10 + 5 — действие', '15 — результат', 'total хранит результат'],
    choiceQuestion: 'Какое число окажется в total?',
    choiceCode: 'int total = 10 + 5;',
    choiceOptions: ['5', '15', '105'],
    correctChoice: 1,
    assemblyPrompt: 'Собери вычисление 10 + 5',
    tokens: ['+', '5', 'total', 'int', ';', '10', '='],
    correctTokens: ['int', 'total', '=', '10', '+', '5', ';'],
    assemblyHint: 'После знака = поставь вычисление 10 + 5.',
    editorInstruction: 'Замени 0 на coins + bonus. Остальные строки не меняй.',
    editorInitial: 'int coins = 10;\nint bonus = 5;\nint total = 0;',
    editorTarget: 'int coins = 10;\nint bonus = 5;\nint total = coins + bonus;',
    editorHint: 'Третья строка должна выглядеть так: int total = coins + bonus;',
    reinforcementQuestion: 'Какое значение получит score?',
    reinforcementCode: 'int score = 7 + 3;',
    reinforcementOptions: ['4', '10', '73'],
    correctReinforcement: 1,
    finishTitle: 'Ты научился складывать',
    finishLead: 'Теперь можно считать монеты, очки, урон и другие игровые значения.',
    skills: ['Используешь знак +', 'Сохраняешь результат вычисления', 'Складываешь значения переменных'],
    nextTitle: 'Начать урок 4',
  },
  {
    id: 'output',
    number: 4,
    title: 'Показываем текст',
    description: 'Выводим сообщение программы на экран с помощью cout.',
    duration: '9 минут',
    xp: 40,
    theoryTitle: 'cout показывает сообщение',
    theoryLead: 'Текст берём в кавычки, а команда cout отправляет его на экран. Стрелки << показывают направление.',
    theoryExample: 'std::cout << "Привет!";',
    theoryNotes: ['std::cout — экран', '<< — отправить', '"Привет!" — текст'],
    choiceQuestion: 'Что программа покажет на экране?',
    choiceCode: 'std::cout << "Привет!";',
    choiceOptions: ['Привет!', 'std::cout', 'Ничего'],
    correctChoice: 0,
    assemblyPrompt: 'Собери команду «Старт!»',
    tokens: ['"Старт!"', ';', 'std::cout', '<<'],
    correctTokens: ['std::cout', '<<', '"Старт!"', ';'],
    assemblyHint: 'Сначала cout, затем стрелки, текст и ;',
    editorInstruction: 'Замени текст «Привет!» на «Игра началась!». Кавычки оставь.',
    editorInitial: 'std::cout << "Привет!";',
    editorTarget: 'std::cout << "Игра началась!";',
    editorHint: 'Готовая строка: std::cout << "Игра началась!";',
    reinforcementQuestion: 'Какой текст появится на экране?',
    reinforcementCode: 'std::cout << "Победа!";',
    reinforcementOptions: ['cout', 'Победа!', 'Старт!'],
    correctReinforcement: 1,
    finishTitle: 'Программа заговорила',
    finishLead: 'Теперь ты умеешь показывать игроку сообщения и результаты.',
    skills: ['Используешь std::cout', 'Пишешь текст в кавычках', 'Предсказываешь результат программы'],
    nextTitle: 'Начать урок 5',
  },
  {
    id: 'condition',
    number: 5,
    title: 'Если — то',
    description: 'Учим программу принимать простое решение по условию.',
    duration: '10 минут',
    xp: 40,
    theoryTitle: 'if проверяет условие',
    theoryLead: 'Слово if означает «если». Код внутри фигурных скобок выполнится только тогда, когда условие верно.',
    theoryExample: 'if (coins > 0) { openDoor(); }',
    theoryNotes: ['if — если', 'coins > 0 — проверка', 'openDoor() — действие'],
    choiceQuestion: 'Откроется ли дверь, если coins равно 3?',
    choiceCode: 'if (coins > 0) { openDoor(); }',
    choiceOptions: ['Да, откроется', 'Нет, не откроется', 'Монеты станут равны 0'],
    correctChoice: 0,
    assemblyPrompt: 'Собери условие открытия двери',
    tokens: ['openDoor();', ')', '0', 'if', '}', 'coins', '(', '{', '>'],
    correctTokens: ['if', '(', 'coins', '>', '0', ')', '{', 'openDoor();', '}'],
    assemblyHint: 'После if идёт проверка в круглых скобках, затем действие в фигурных.',
    editorInstruction: 'Сейчас нужно больше 10 монет. Измени условие так, чтобы хватило хотя бы одной монеты.',
    editorInitial: 'int coins = 5;\nif (coins > 10)\n{\n    openDoor();\n}',
    editorTarget: 'int coins = 5;\nif (coins > 0)\n{\n    openDoor();\n}',
    editorHint: 'В условии замени 10 на 0: if (coins > 0)',
    reinforcementQuestion: 'Что произойдёт, если health равно 0?',
    reinforcementCode: 'if (health == 0) { gameOver(); }',
    reinforcementOptions: ['Запустится gameOver()', 'Здоровье станет 1', 'Ничего не произойдёт'],
    correctReinforcement: 0,
    finishTitle: 'Программа принимает решения',
    finishLead: 'Теперь код может проверять монеты, здоровье и другие игровые условия.',
    skills: ['Понимаешь условие if', 'Используешь сравнения > и ==', 'Запускаешь действие по условию'],
    nextTitle: 'Начать урок 6',
  },
  {
    id: 'loop',
    number: 6,
    title: 'Повторяем действия',
    description: 'Знакомимся с циклом и повторяем команду несколько раз.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'Цикл повторяет код',
    theoryLead: 'for запускает одно действие несколько раз. Счётчик i начинает с нуля и растёт после каждого повтора.',
    theoryExample: 'for (int i = 0; i < 3; i++) { spawnCoin(); }',
    theoryNotes: ['i = 0 — начинаем', 'i < 3 — повторяем 3 раза', 'i++ — прибавляем 1'],
    choiceQuestion: 'Сколько монет появится?',
    choiceCode: 'for (int i = 0; i < 3; i++) { spawnCoin(); }',
    choiceOptions: ['1 монета', '3 монеты', 'Бесконечно много'],
    correctChoice: 1,
    assemblyPrompt: 'Собери цикл на 3 повтора',
    tokens: ['i++', ')', 'i < 3', ';', 'for', 'int i = 0', '(', ';'],
    correctTokens: ['for', '(', 'int i = 0', ';', 'i < 3', ';', 'i++', ')'],
    assemblyHint: 'Внутри круглых скобок три части, разделённые двумя ;',
    editorInstruction: 'Цикл запускается один раз. Измени число так, чтобы монета появилась 3 раза.',
    editorInitial: 'for (int i = 0; i < 1; i++)\n{\n    spawnCoin();\n}',
    editorTarget: 'for (int i = 0; i < 3; i++)\n{\n    spawnCoin();\n}',
    editorHint: 'В проверке i < 1 замени число 1 на 3.',
    reinforcementQuestion: 'Сколько раз выполнится jump()?',
    reinforcementCode: 'for (int i = 0; i < 5; i++) { jump(); }',
    reinforcementOptions: ['4 раза', '5 раз', '6 раз'],
    correctReinforcement: 1,
    finishTitle: 'Ты управляешь повторами',
    finishLead: 'Циклы помогут создавать монеты, врагов, эффекты и повторяющиеся действия.',
    skills: ['Понимаешь задачу цикла', 'Меняешь количество повторов', 'Читаешь простой цикл for'],
    nextTitle: 'Начать урок 7',
  },
  {
    id: 'function',
    number: 7,
    title: 'Своя команда',
    description: 'Объединяем несколько действий в функцию с понятным именем.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'Функция — твоя команда',
    theoryLead: 'Мы даём блоку кода имя, а затем запускаем его одной короткой строкой. Это помогает не повторять одинаковый код.',
    theoryExample: 'void ShowWin() { std::cout << "Победа!"; }',
    theoryNotes: ['void — создаём команду', 'ShowWin — имя', 'ShowWin(); — запускаем'],
    choiceQuestion: 'Какая строка запускает функцию ShowWin?',
    choiceCode: 'void ShowWin() { /* действия */ }',
    choiceOptions: ['void ShowWin', 'ShowWin();', 'run ShowWin'],
    correctChoice: 1,
    assemblyPrompt: 'Собери функцию Jump',
    tokens: ['jump();', '}', ')', 'Jump', 'void', '{', '('],
    correctTokens: ['void', 'Jump', '(', ')', '{', 'jump();', '}'],
    assemblyHint: 'После void поставь имя, круглые скобки и тело функции в { }.',
    editorInstruction: 'Переименуй непонятную функцию x в ShowScore. Код внутри не меняй.',
    editorInitial: 'void x()\n{\n    std::cout << "Счёт";\n}',
    editorTarget: 'void ShowScore()\n{\n    std::cout << "Счёт";\n}',
    editorHint: 'В первой строке замени только x на ShowScore.',
    reinforcementQuestion: 'Что делает строка ShowScore();?',
    reinforcementCode: 'ShowScore();',
    reinforcementOptions: ['Создаёт число', 'Запускает функцию', 'Удаляет функцию'],
    correctReinforcement: 1,
    finishTitle: 'Ты создаёшь свои команды',
    finishLead: 'Это важный шаг к классам, игровым объектам и программированию в Unreal Engine.',
    skills: ['Создаёшь простую функцию', 'Даёшь функции понятное имя', 'Запускаешь функцию по имени'],
    nextTitle: 'Начать урок 8',
  },
  {
    id: 'bool',
    number: 8,
    title: 'Да или нет: bool',
    description: 'Храним состояния, у которых есть только два варианта.',
    duration: '9 минут',
    xp: 40,
    theoryTitle: 'bool хранит true или false',
    theoryLead: 'Некоторые вопросы имеют только два ответа: есть ли ключ, открыта ли дверь, жив ли игрок. Для них используется bool.',
    theoryExample: 'bool hasKey = true;',
    theoryNotes: ['bool — тип состояния', 'true — да', 'false — нет'],
    choiceQuestion: 'Есть ли у игрока ключ?',
    choiceCode: 'bool hasKey = true;',
    choiceOptions: ['Да, есть', 'Нет ключа', 'Ключей 100'],
    correctChoice: 0,
    assemblyPrompt: 'Собери состояние «дверь открыта»',
    tokens: ['true', 'doorOpen', ';', 'bool', '='],
    correctTokens: ['bool', 'doorOpen', '=', 'true', ';'],
    assemblyHint: 'После имени doorOpen запиши одно из двух значений: true или false.',
    editorInstruction: 'Дверь сейчас закрыта. Измени false на true, чтобы открыть её.',
    editorInitial: 'bool doorOpen = false;',
    editorTarget: 'bool doorOpen = true;',
    editorHint: 'Оставь имя doorOpen и замени только false на true.',
    reinforcementQuestion: 'Что означает это состояние?',
    reinforcementCode: 'bool isAlive = false;',
    reinforcementOptions: ['Игрок не жив', 'Игрок жив', 'У игрока 0 монет'],
    correctReinforcement: 0,
    finishTitle: 'Ты управляешь состояниями',
    finishLead: 'Теперь код может помнить ответы «да» и «нет».',
    skills: ['Используешь тип bool', 'Различаешь true и false', 'Изменяешь состояние объекта'],
    nextTitle: 'Начать урок 9',
  },
  {
    id: 'parameters',
    number: 9,
    title: 'Параметры функций',
    description: 'Передаём функции число, с которым она должна работать.',
    duration: '11 минут',
    xp: 40,
    theoryTitle: 'Параметр передаёт данные внутрь',
    theoryLead: 'Одна функция может добавлять разное количество монет. Число в круглых скобках сообщает, сколько именно.',
    theoryExample: 'AddCoins(5);',
    theoryNotes: ['AddCoins — функция', '(5) — передаём число', '; — конец команды'],
    choiceQuestion: 'Сколько монет добавит команда?',
    choiceCode: 'AddCoins(5);',
    choiceOptions: ['1 монету', '5 монет', 'Ни одной'],
    correctChoice: 1,
    assemblyPrompt: 'Собери вызов AddCoins с числом 5',
    tokens: [')', '5', ';', 'AddCoins', '('],
    correctTokens: ['AddCoins', '(', '5', ')', ';'],
    assemblyHint: 'Имя функции, круглые скобки с числом и ; в конце.',
    editorInstruction: 'Сейчас функция добавляет 1 монету. Измени значение на 10.',
    editorInitial: 'AddCoins(1);',
    editorTarget: 'AddCoins(10);',
    editorHint: 'В круглых скобках должно быть число 10.',
    reinforcementQuestion: 'Сколько урона получит игрок?',
    reinforcementCode: 'TakeDamage(20);',
    reinforcementOptions: ['2', '20', '200'],
    correctReinforcement: 1,
    finishTitle: 'Функции стали гибкими',
    finishLead: 'Теперь одна команда может работать с разными числами.',
    skills: ['Передаёшь значение в функцию', 'Читаешь вызов с параметром', 'Меняешь силу действия'],
    nextTitle: 'Начать урок 10',
  },
  {
    id: 'arrays',
    number: 10,
    title: 'Список значений',
    description: 'Храним несколько похожих значений под одним именем.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'Массив — ряд ячеек',
    theoryLead: 'Вместо трёх отдельных переменных можно создать один список. Нумерация элементов начинается с нуля.',
    theoryExample: 'int scores[3] = {10, 20, 30};',
    theoryNotes: ['[3] — три элемента', '{ } — значения списка', 'scores[0] — первый элемент'],
    choiceQuestion: 'Какое значение находится в scores[0]?',
    choiceCode: 'int scores[3] = {10, 20, 30};',
    choiceOptions: ['10', '20', '30'],
    correctChoice: 0,
    assemblyPrompt: 'Собери список из трёх очков',
    tokens: ['{10,20,30}', 'scores', ';', '[3]', 'int', '='],
    correctTokens: ['int', 'scores', '[3]', '=', '{10,20,30}', ';'],
    assemblyHint: 'После имени укажи размер [3], затем значения в фигурных скобках.',
    editorInstruction: 'Выбери третий результат из списка. Помни: счёт начинается с нуля.',
    editorInitial: 'int scores[3] = {10, 20, 30};\nint best = scores[0];',
    editorTarget: 'int scores[3] = {10, 20, 30};\nint best = scores[2];',
    editorHint: 'Третий элемент имеет индекс 2: scores[2].',
    reinforcementQuestion: 'Какое значение хранится в lives[1]?',
    reinforcementCode: 'int lives[3] = {3, 2, 1};',
    reinforcementOptions: ['3', '2', '1'],
    correctReinforcement: 1,
    finishTitle: 'Ты работаешь со списками',
    finishLead: 'Массивы пригодятся для очков, предметов и набора игровых значений.',
    skills: ['Создаёшь простой массив', 'Знаешь, что индекс начинается с 0', 'Получаешь элемент по индексу'],
    nextTitle: 'Начать урок 11',
  },
  {
    id: 'class-basics',
    number: 11,
    title: 'Классы и объекты',
    description: 'Собираем данные и действия будущего игрового объекта вместе.',
    duration: '14 минут',
    xp: 40,
    theoryTitle: 'Класс — чертёж объекта',
    theoryLead: 'Класс описывает, какие данные и возможности будут у объекта. По одному чертежу можно создать много игроков или врагов.',
    theoryExample: 'class Player { int health = 100; };',
    theoryNotes: ['class — создаём чертёж', 'Player — имя класса', 'health — данные объекта'],
    choiceQuestion: 'Что описывает class Player?',
    choiceCode: 'class Player { int health = 100; };',
    choiceOptions: ['Чертёж игрока', 'Одно случайное число', 'Только сообщение'],
    correctChoice: 0,
    assemblyPrompt: 'Собери простой класс Player',
    tokens: ['health', '}', 'Player', '= 100;', 'class', '{', 'int', ';'],
    correctTokens: ['class', 'Player', '{', 'int', 'health', '= 100;', '}', ';'],
    assemblyHint: 'Начни с class Player, а данные помести между { и }.',
    editorInstruction: 'Добавь игроку количество монет coins со стартовым значением 0.',
    editorInitial: 'class Player\n{\n    int health = 100;\n};',
    editorTarget: 'class Player\n{\n    int health = 100;\n    int coins = 0;\n};',
    editorHint: 'Перед }; добавь строку int coins = 0;',
    reinforcementQuestion: 'Что такое класс в этом уроке?',
    reinforcementCode: 'class Enemy { int health = 50; };',
    reinforcementOptions: ['Чертёж объекта', 'Готовая картинка', 'Один вызов функции'],
    correctReinforcement: 0,
    finishTitle: 'Ты понимаешь устройство класса',
    finishLead: 'Теперь переход к AActor в Unreal будет понятнее и спокойнее.',
    skills: ['Понимаешь класс как чертёж', 'Добавляешь данные в класс', 'Читаешь структуру объекта'],
    nextTitle: 'Перейти к Unreal',
  },
  {
    id: 'unreal-intro',
    number: 12,
    title: 'Переходим в Unreal',
    description: 'Переносим знакомый C++ в игровые объекты Unreal Engine.',
    duration: '10 минут',
    xp: 40,
    theoryTitle: 'В Unreal работает тот же C++',
    theoryLead: 'Переменные, условия и функции никуда не исчезают. Теперь они будут управлять здоровьем, прыжком и объектами игры.',
    theoryExample: 'int PlayerHealth = 100;',
    theoryNotes: ['int — знакомый тип', 'PlayerHealth — здоровье', '100 — стартовое значение'],
    choiceQuestion: 'Что из изученного продолжит работать в Unreal?',
    choiceCode: 'int PlayerHealth = 100;',
    choiceOptions: ['Переменные C++', 'Только картинки', 'Ничего'],
    correctChoice: 0,
    assemblyPrompt: 'Собери здоровье игрока',
    tokens: ['100', 'PlayerHealth', ';', 'int', '='],
    correctTokens: ['int', 'PlayerHealth', '=', '100', ';'],
    assemblyHint: 'Это уже знакомая переменная — только имя стало игровым.',
    editorInstruction: 'Высота прыжка слишком маленькая. Измени 100 на 300.',
    editorInitial: 'int JumpHeight = 100;',
    editorTarget: 'int JumpHeight = 300;',
    editorHint: 'Оставь имя JumpHeight и замени только число на 300.',
    reinforcementQuestion: 'Что хранит эта строка?',
    reinforcementCode: 'int EnemyHealth = 50;',
    reinforcementOptions: ['Здоровье врага', 'Имя уровня', 'Количество игроков'],
    correctReinforcement: 0,
    finishTitle: 'Ты готов к игровым объектам',
    finishLead: 'Обычный C++ стал частью игры. Следующий шаг — объект Actor.',
    skills: ['Переносишь знания C++ в Unreal', 'Читаешь игровые переменные', 'Настраиваешь параметры игры'],
    nextTitle: 'Начать урок 13',
  },
  {
    id: 'actor',
    number: 13,
    title: 'Первый Actor',
    description: 'Создаём класс игрового объекта на основе AActor.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'Actor — объект игрового мира',
    theoryLead: 'Дверь, монета или платформа могут быть Actor. Новый класс берёт готовые возможности у AActor.',
    theoryExample: 'class ACoin : public AActor { };',
    theoryNotes: ['class — новый вид объекта', 'ACoin — имя объекта', 'AActor — основа Unreal'],
    choiceQuestion: 'Что может быть Actor в игровом мире?',
    choiceCode: 'class ACoin : public AActor { };',
    choiceOptions: ['Монета или дверь', 'Только число', 'Только текст'],
    correctChoice: 0,
    assemblyPrompt: 'Собери класс монеты ACoin',
    tokens: ['AActor', '}', 'class', 'public', ';', 'ACoin', ':', '{'],
    correctTokens: ['class', 'ACoin', ':', 'public', 'AActor', '{', '}', ';'],
    assemblyHint: 'После имени ACoin укажи основу: : public AActor',
    editorInstruction: 'Это заготовка монеты. Переименуй ABox в ACoin.',
    editorInitial: 'class ABox : public AActor\n{\n};',
    editorTarget: 'class ACoin : public AActor\n{\n};',
    editorHint: 'В первой строке замени только ABox на ACoin.',
    reinforcementQuestion: 'Что означает public AActor?',
    reinforcementCode: 'class ADoor : public AActor { };',
    reinforcementOptions: ['ADoor основан на AActor', 'ADoor удаляет AActor', 'ADoor — обычное число'],
    correctReinforcement: 0,
    finishTitle: 'Первый Actor создан',
    finishLead: 'Теперь можно добавлять в класс свойства и игровое поведение.',
    skills: ['Понимаешь роль Actor', 'Читаешь простое объявление класса', 'Создаёшь класс на основе AActor'],
    nextTitle: 'Начать урок 14',
  },
  {
    id: 'beginplay',
    number: 14,
    title: 'Событие BeginPlay',
    description: 'Запускаем код один раз в момент появления объекта в игре.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'BeginPlay — старт объекта',
    theoryLead: 'Unreal автоматически вызывает BeginPlay, когда начинается игра. Внутри размещают начальные действия объекта.',
    theoryExample: 'void BeginPlay() { StartGame(); }',
    theoryNotes: ['Unreal вызывает функцию', 'Один раз при старте', 'Внутри — первые действия'],
    choiceQuestion: 'Когда Unreal вызывает BeginPlay?',
    choiceCode: 'void BeginPlay() { StartGame(); }',
    choiceOptions: ['Один раз при старте', 'Каждую секунду', 'Только после закрытия игры'],
    correctChoice: 0,
    assemblyPrompt: 'Собери стартовую функцию',
    tokens: ['StartGame();', ')', 'void', '}', 'BeginPlay', '{', '('],
    correctTokens: ['void', 'BeginPlay', '(', ')', '{', 'StartGame();', '}'],
    assemblyHint: 'Собери обычную функцию с именем BeginPlay и действием внутри.',
    editorInstruction: 'Добавь ShowMessage(); после обязательной строки Super::BeginPlay();',
    editorInitial: 'void BeginPlay()\n{\n    Super::BeginPlay();\n}',
    editorTarget: 'void BeginPlay()\n{\n    Super::BeginPlay();\n    ShowMessage();\n}',
    editorHint: 'Добавь новую строку ShowMessage(); перед закрывающей скобкой.',
    reinforcementQuestion: 'Сколько раз выполнится ShowMessage()?',
    reinforcementCode: 'void BeginPlay() { ShowMessage(); }',
    reinforcementOptions: ['Один раз при старте', 'Каждый кадр', 'Ни разу'],
    correctReinforcement: 0,
    finishTitle: 'Actor оживает при старте',
    finishLead: 'Ты связал C++ с жизненным циклом объекта Unreal Engine.',
    skills: ['Знаешь назначение BeginPlay', 'Сохраняешь вызов Super', 'Добавляешь стартовое действие'],
    nextTitle: 'Начать урок 15',
  },
  {
    id: 'tick',
    number: 15,
    title: 'Tick и кадры',
    description: 'Запускаем движение каждый кадр и знакомимся с DeltaTime.',
    duration: '12 минут',
    xp: 40,
    theoryTitle: 'Tick работает каждый кадр',
    theoryLead: 'В отличие от BeginPlay, функция Tick вызывается снова и снова, пока объект существует в игре.',
    theoryExample: 'void Tick(float DeltaTime) { Move(DeltaTime); }',
    theoryNotes: ['Tick — каждый кадр', 'DeltaTime — время кадра', 'Move — движение'],
    choiceQuestion: 'Как часто вызывается Tick?',
    choiceCode: 'void Tick(float DeltaTime) { Move(DeltaTime); }',
    choiceOptions: ['Каждый кадр', 'Один раз при старте', 'Только при столкновении'],
    correctChoice: 0,
    assemblyPrompt: 'Собери функцию Tick',
    tokens: ['Move(DeltaTime);', '}', 'Tick', 'void', '{', '(float DeltaTime)'],
    correctTokens: ['void', 'Tick', '(float DeltaTime)', '{', 'Move(DeltaTime);', '}'],
    assemblyHint: 'После имени Tick поставь параметр float DeltaTime.',
    editorInstruction: 'Увеличь скорость движения со 100 до 200. DeltaTime оставь на месте.',
    editorInitial: 'void Tick(float DeltaTime)\n{\n    Move(100 * DeltaTime);\n}',
    editorTarget: 'void Tick(float DeltaTime)\n{\n    Move(200 * DeltaTime);\n}',
    editorHint: 'В строке Move замени только 100 на 200.',
    reinforcementQuestion: 'Зачем нужен DeltaTime?',
    reinforcementCode: 'Move(Speed * DeltaTime);',
    reinforcementOptions: ['Чтобы движение не зависело от FPS', 'Чтобы удалить Actor', 'Чтобы запустить BeginPlay'],
    correctReinforcement: 0,
    finishTitle: 'Объект движется по кадрам',
    finishLead: 'Теперь ты различаешь одноразовый BeginPlay и постоянный Tick.',
    skills: ['Знаешь назначение Tick', 'Понимаешь роль DeltaTime', 'Меняешь скорость движения'],
    nextTitle: 'Начать урок 16',
  },
  {
    id: 'components',
    number: 16,
    title: 'Компоненты Actor',
    description: 'Собираем игровой объект из сетки, камеры и зоны столкновения.',
    duration: '14 минут',
    xp: 40,
    theoryTitle: 'Компоненты — части Actor',
    theoryLead: 'Actor похож на конструктор. Mesh отвечает за внешний вид, Camera — за камеру, а Box Collision — за невидимую зону.',
    theoryExample: 'UStaticMeshComponent* Mesh;',
    theoryNotes: ['Actor — целый объект', 'Component — его часть', 'Mesh — видимая модель'],
    choiceQuestion: 'Какой компонент показывает 3D-модель?',
    choiceCode: 'UStaticMeshComponent* Mesh;',
    choiceOptions: ['Mesh', 'Timer', 'BeginPlay'],
    correctChoice: 0,
    assemblyPrompt: 'Собери объявление Mesh-компонента',
    tokens: ['Mesh', ';', '*', 'UStaticMeshComponent'],
    correctTokens: ['UStaticMeshComponent', '*', 'Mesh', ';'],
    assemblyHint: 'Сначала тип компонента, затем *, имя Mesh и ;',
    editorInstruction: 'Добавь Trigger — зону столкновения типа UBoxComponent*.',
    editorInitial: 'UStaticMeshComponent* Mesh;',
    editorTarget: 'UStaticMeshComponent* Mesh;\nUBoxComponent* Trigger;',
    editorHint: 'На новой строке напиши UBoxComponent* Trigger;',
    reinforcementQuestion: 'Для чего обычно нужен CameraComponent?',
    reinforcementCode: 'UCameraComponent* Camera;',
    reinforcementOptions: ['Для точки обзора', 'Для хранения монет', 'Для таймера'],
    correctReinforcement: 0,
    finishTitle: 'Actor собран из частей',
    finishLead: 'Теперь ты понимаешь, как Unreal разделяет внешний вид, камеру и столкновения.',
    skills: ['Понимаешь компоненты', 'Объявляешь Mesh и Trigger', 'Выбираешь компонент под задачу'],
    nextTitle: 'Начать урок 17',
  },
  {
    id: 'collision',
    number: 17,
    title: 'Столкновение',
    description: 'Запускаем код, когда игрок входит в зону игрового объекта.',
    duration: '14 минут',
    xp: 40,
    theoryTitle: 'Overlap сообщает о пересечении',
    theoryLead: 'Unreal вызывает событие, когда один объект входит в Collision-зону другого. Так работают монеты, двери и ловушки.',
    theoryExample: 'void OnOverlap() { AddCoins(1); }',
    theoryNotes: ['Collision — зона', 'OnOverlap — событие', 'Внутри — реакция'],
    choiceQuestion: 'Когда вызывается OnOverlap?',
    choiceCode: 'void OnOverlap() { AddCoins(1); }',
    choiceOptions: ['При входе в зону', 'Каждый кадр', 'До запуска игры'],
    correctChoice: 0,
    assemblyPrompt: 'Собери реакцию на столкновение',
    tokens: ['AddCoins(1);', 'OnOverlap', 'void', '}', '{', '(', ')'],
    correctTokens: ['void', 'OnOverlap', '(', ')', '{', 'AddCoins(1);', '}'],
    assemblyHint: 'Это функция OnOverlap с действием AddCoins внутри.',
    editorInstruction: 'Большая монета должна давать 10 очков. Измени параметр AddCoins.',
    editorInitial: 'void OnOverlap()\n{\n    AddCoins(1);\n}',
    editorTarget: 'void OnOverlap()\n{\n    AddCoins(10);\n}',
    editorHint: 'В вызове AddCoins замени 1 на 10.',
    reinforcementQuestion: 'Что удобно запускать при входе в опасную зону?',
    reinforcementCode: 'void OnOverlap() { TakeDamage(20); }',
    reinforcementOptions: ['Получение урона', 'Создание класса', 'Изменение FPS'],
    correctReinforcement: 0,
    finishTitle: 'Мир реагирует на игрока',
    finishLead: 'Теперь игровые объекты могут выдавать награду, наносить урон и открывать двери.',
    skills: ['Понимаешь Collision-зону', 'Реагируешь на OnOverlap', 'Передаёшь значение в событии'],
    nextTitle: 'Начать урок 18',
  },
  {
    id: 'timer',
    number: 18,
    title: 'Таймер события',
    description: 'Откладываем игровое действие на несколько секунд.',
    duration: '15 минут',
    xp: 40,
    theoryTitle: 'Таймер вызывает функцию позже',
    theoryLead: 'Игра продолжает работать, а таймер ждёт. Когда время закончится, Unreal вызовет указанную функцию.',
    theoryExample: 'SetTimer(2.0f, OpenDoor);',
    theoryNotes: ['2.0f — ждать 2 секунды', 'OpenDoor — что вызвать', 'false — без повтора'],
    choiceQuestion: 'Когда откроется дверь?',
    choiceCode: 'SetTimer(2.0f, OpenDoor);',
    choiceOptions: ['Через 2 секунды', 'Сразу', 'Через 20 секунд'],
    correctChoice: 0,
    assemblyPrompt: 'Собери простой таймер двери',
    tokens: ['OpenDoor', ';', 'SetTimer', '2.0f', ')', ',', '('],
    correctTokens: ['SetTimer', '(', '2.0f', ',', 'OpenDoor', ')', ';'],
    assemblyHint: 'Внутри SetTimer сначала время, затем функция через запятую.',
    editorInstruction: 'Дверь ждёт 5 секунд. Измени задержку на 2 секунды.',
    editorInitial: 'GetWorldTimerManager().SetTimer(Timer, this, &ADoor::Open, 5.0f, false);',
    editorTarget: 'GetWorldTimerManager().SetTimer(Timer, this, &ADoor::Open, 2.0f, false);',
    editorHint: 'В длинной строке замени только 5.0f на 2.0f.',
    reinforcementQuestion: 'Что означает false в конце SetTimer?',
    reinforcementCode: 'SetTimer(Timer, this, &ADoor::Open, 2.0f, false);',
    reinforcementOptions: ['Сработать один раз', 'Повторять бесконечно', 'Не запускать функцию'],
    correctReinforcement: 0,
    finishTitle: 'Ты управляешь временем',
    finishLead: 'Теперь можешь откладывать события, закрывать двери и создавать исчезающие платформы.',
    skills: ['Понимаешь работу таймера', 'Настраиваешь задержку', 'Выбираешь одноразовый запуск'],
  },
]

type ProgressiveLessonProps = {
  config: AdvancedLessonConfig
  onXp: (points: number) => void
  notify: (message: string, tone?: Toast['tone']) => void
  onComplete: () => void
  onNext?: () => void
}

function ProgressiveLesson({ config, onXp, notify, onComplete, onNext }: ProgressiveLessonProps) {
  const key = `evilpin-${config.id}`
  const [slide, setSlide] = useState(0)
  const [choiceAnswer, setChoiceAnswer] = useState<number | null>(null)
  const [choiceSolved, setChoiceSolved] = useState(() => localStorage.getItem(`${key}-choice`) === '1')
  const [assemblySolved, setAssemblySolved] = useState(() => localStorage.getItem(`${key}-assembly`) === '1')
  const [pieces, setPieces] = useState<string[]>(() => localStorage.getItem(`${key}-assembly`) === '1' ? config.correctTokens : [])
  const [bank, setBank] = useState<string[]>(() => localStorage.getItem(`${key}-assembly`) === '1' ? [] : config.tokens)
  const [assemblyError, setAssemblyError] = useState(false)
  const [editorCode, setEditorCode] = useState(() => localStorage.getItem(`${key}-editor`) === '1' ? config.editorTarget : config.editorInitial)
  const [editorStatus, setEditorStatus] = useState<RunStatus>(() => localStorage.getItem(`${key}-editor`) === '1' ? 'success' : 'idle')
  const [reinforcementAnswer, setReinforcementAnswer] = useState<number | null>(null)
  const [complete, setComplete] = useState(() => localStorage.getItem(`${key}-complete`) === '1')

  const editorSolved = editorStatus === 'success'
  const lessonSlides = ['Теория', 'Выбор', 'Собираем', 'Практика', 'Закрепляем', 'Итог']
  const progress = complete ? 100 : [14, 30, 48, 67, 86, 96][slide]
  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()

  const canOpen = (index: number) => {
    if (index <= 1) return true
    if (index === 2) return choiceSolved
    if (index === 3) return assemblySolved
    if (index === 4) return editorSolved
    return complete
  }

  const go = (index: number) => {
    if (index >= 0 && index < lessonSlides.length && canOpen(index)) setSlide(index)
  }

  const choose = (index: number) => {
    setChoiceAnswer(index)
    if (index === config.correctChoice && !choiceSolved) {
      setChoiceSolved(true)
      localStorage.setItem(`${key}-choice`, '1')
      onXp(5)
      notify('+5 XP · Правильный ответ', 'success')
    }
  }

  const addPiece = (piece: string) => {
    if (assemblySolved) return
    setBank((current) => {
      const pieceIndex = current.indexOf(piece)
      return current.filter((_, index) => index !== pieceIndex)
    })
    setPieces((current) => [...current, piece])
    setAssemblyError(false)
  }

  const removePiece = (piece: string, selectedIndex: number) => {
    if (assemblySolved) return
    setPieces((current) => current.filter((_, index) => index !== selectedIndex))
    setBank((current) => [...current, piece])
    setAssemblyError(false)
  }

  const resetAssembly = () => {
    if (assemblySolved) return
    setPieces([])
    setBank(config.tokens)
    setAssemblyError(false)
  }

  const checkAssembly = () => {
    if (pieces.join(' ') === config.correctTokens.join(' ')) {
      if (!assemblySolved) {
        setAssemblySolved(true)
        localStorage.setItem(`${key}-assembly`, '1')
        onXp(5)
        notify('+5 XP · Команда собрана', 'success')
      }
      setAssemblyError(false)
    } else {
      setAssemblyError(true)
    }
  }

  const checkEditor = () => {
    if (normalize(editorCode) === normalize(config.editorTarget)) {
      if (!editorSolved) {
        localStorage.setItem(`${key}-editor`, '1')
        onXp(15)
        notify('+15 XP · Код работает', 'success')
      }
      setEditorStatus('success')
    } else {
      setEditorStatus('error')
    }
  }

  const finish = (index: number) => {
    setReinforcementAnswer(index)
    if (index === config.correctReinforcement && !complete) {
      setComplete(true)
      localStorage.setItem(`${key}-complete`, '1')
      onXp(15)
      onComplete()
      notify('+15 XP · Урок завершён', 'success')
    }
  }

  return (
    <>
      <section className="lesson-header">
        <div className="lesson-title-wrap"><span className="lesson-kicker"><span>УРОК {config.number}</span><i /> ШАГ СЛОЖНЕЕ</span><h1>{config.title}</h1><p>{config.description}</p></div>
        <div className="lesson-meta"><span><Clock3 size={15} /> {config.duration}</span><span><Zap size={15} /> +{config.xp} XP</span></div>
      </section>
      <div className="lesson-progress-row"><div className="lesson-progress-track"><span style={{ width: `${progress}%` }} /></div><strong>{progress}%</strong></div>
      <nav className="slide-tabs" aria-label={`Этапы урока ${config.number}`}>
        {lessonSlides.map((label, index) => {
          const passed = index < slide || (index === 1 && choiceSolved) || (index === 2 && assemblySolved) || (index === 3 && editorSolved) || (index >= 4 && complete)
          return <button key={label} className={`${slide === index ? 'active' : ''} ${passed ? 'passed' : ''}`} disabled={!canOpen(index)} onClick={() => go(index)}><span>{passed ? <Check size={14} /> : `0${index + 1}`}</span>{label}</button>
        })}
      </nav>

      <section className="slide-stage glass-panel">
        {slide === 0 && (
          <div className="slide-content advanced-theory-slide slide-enter">
            <div className="advanced-theory-copy"><span className="section-tag"><BookOpen size={15} /> ТЕОРИЯ · 45 СЕКУНД</span><h2>{config.theoryTitle}</h2><p className="lead">{config.theoryLead}</p><div className="large-code-example"><Code2 size={18} /><code>{config.theoryExample}</code></div><div className="theory-note-grid">{config.theoryNotes.map((note, index) => <div key={note}><span>0{index + 1}</span><p>{note}</p></div>)}</div><button className="primary-button" onClick={() => go(1)}>Проверить понимание <ArrowRight size={17} /></button></div>
            <aside className="rule-card"><Lightbulb size={24} /><strong>Не зубри</strong><p>Сначала посмотри на пример. Затем сразу попробуй решить задачу.</p></aside>
          </div>
        )}

        {slide === 1 && (
          <div className="slide-content choice-slide slide-enter"><div className="choice-card"><span className="section-tag"><Target size={15} /> ВЫБЕРИ ОТВЕТ</span><h2>{config.choiceQuestion}</h2><div className="choice-code"><code>{config.choiceCode}</code></div><div className="answer-list choice-answers">{config.choiceOptions.map((answer, index) => { const show = choiceAnswer === index || (choiceSolved && index === config.correctChoice); return <button key={answer} className={show ? (index === config.correctChoice ? 'correct' : 'wrong') : ''} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span><p><code>{answer}</code></p>{show && (index === config.correctChoice ? <CheckCircle2 size={20} /> : <X size={20} />)}</button> })}</div>{choiceAnswer !== null && <div className={`answer-feedback ${choiceAnswer === config.correctChoice ? 'correct' : 'wrong'}`}><p><strong>{choiceAnswer === config.correctChoice ? 'Правильно!' : 'Попробуй ещё раз'}</strong><span>{choiceAnswer === config.correctChoice ? 'Можно переходить к сборке кода.' : 'Ещё раз посмотри на пример из теории.'}</span></p></div>}<button className="primary-button choice-next" disabled={!choiceSolved} onClick={() => go(2)}>Собрать код <Puzzle size={17} /></button></div><aside className="choice-side-note"><div className="side-note-icon"><Heart size={22} fill="currentColor" /></div><strong>Без штрафа</strong><p>Неправильный ответ — это часть обучения.</p></aside></div>
        )}

        {slide === 2 && (
          <div className="slide-content assembly-slide slide-enter"><div className="assembly-heading"><div><span className="section-tag"><Puzzle size={15} /> СОБЕРИ КОД</span><h2>{config.assemblyPrompt}</h2><p className="lead">Нажимай на карточки в нужном порядке.</p></div><button className="icon-button" onClick={resetAssembly} disabled={assemblySolved} title="Собрать заново" aria-label="Собрать заново"><RotateCcw size={18} /></button></div><div className={`assembly-workbench ${assemblyError ? 'has-error' : ''} ${assemblySolved ? 'is-solved' : ''}`}><span className="workbench-label">ТВОЯ СТРОКА</span><div className="assembly-slots">{pieces.map((piece, index) => <button key={`${piece}-${index}`} disabled={assemblySolved} onClick={() => removePiece(piece, index)} className="code-piece">{piece}</button>)}{Array.from({ length: config.correctTokens.length - pieces.length }, (_, index) => <span className="empty-code-slot" key={index} />)}</div>{assemblySolved && <div className="assembly-success"><CheckCircle2 size={18} /> Команда собрана правильно.</div>}{assemblyError && <div className="assembly-error"><RefreshCw size={17} /> Порядок пока неверный.</div>}</div><div className="token-bank"><span className="workbench-label">КУСОЧКИ</span><div>{bank.map((piece, index) => <button key={`${piece}-${index}`} onClick={() => addPiece(piece)} className="code-piece">{piece}</button>)}</div></div><div className="assembly-footer"><p><Lightbulb size={17} /> {config.assemblyHint}</p><div><button className="secondary-button" disabled={assemblySolved} onClick={resetAssembly}><RotateCcw size={15} /> Сбросить</button><button className="primary-button" disabled={pieces.length < config.correctTokens.length || assemblySolved} onClick={checkAssembly}>Проверить <Check size={17} /></button>{assemblySolved && <button className="primary-button" onClick={() => go(3)}>К практике <ArrowRight size={17} /></button>}</div></div></div>
        )}

        {slide === 3 && (
          <div className="slide-content advanced-practice-slide slide-enter"><div className="advanced-practice-main"><span className="section-tag"><Code2 size={15} /> ПИШЕМ САМИ</span><h2>Измени готовый код</h2><p className="lead">{config.editorInstruction}</p><div className={`compact-code-editor ${editorStatus}`}><div className="single-line-head"><Code2 size={15} /><span>Practice.cpp</span><small>C++</small></div><textarea value={editorCode} onChange={(event) => { setEditorCode(event.target.value); setEditorStatus('idle') }} spellCheck={false} aria-label={`Редактор урока ${config.number}`} /></div>{editorStatus === 'success' && <div className="reinforcement-feedback success"><CheckCircle2 size={20} /><p><strong>Код работает</strong><span>Ты решил задачу самостоятельно.</span></p></div>}{editorStatus === 'error' && <div className="reinforcement-feedback error"><Lightbulb size={20} /><p><strong>Проверь ещё раз</strong><span>{config.editorHint}</span></p></div>}<div className="reinforcement-actions"><button className={`run-button ${editorStatus}`} onClick={checkEditor}>{editorStatus === 'success' ? <Check size={17} /> : <Play size={16} fill="currentColor" />}{editorStatus === 'success' ? 'Выполнено' : 'Проверить код'}</button>{editorSolved && <button className="primary-button" onClick={() => go(4)}>Закрепить <ArrowRight size={17} /></button>}</div></div><aside className="transfer-card"><span>ЦЕЛЬ</span><code>{config.editorTarget}</code><p>Если застрял — сравни свой код с целью по одной части.</p></aside></div>
        )}

        {slide === 4 && (
          <div className="slide-content choice-slide slide-enter"><div className="choice-card"><span className="section-tag"><Gauge size={15} /> ЗАКРЕПЛЯЕМ</span><h2>{config.reinforcementQuestion}</h2><div className="choice-code"><code>{config.reinforcementCode}</code></div><div className="answer-list choice-answers">{config.reinforcementOptions.map((answer, index) => { const show = reinforcementAnswer === index || (complete && index === config.correctReinforcement); return <button key={answer} className={show ? (index === config.correctReinforcement ? 'correct' : 'wrong') : ''} onClick={() => finish(index)}><span>{String.fromCharCode(65 + index)}</span><p><code>{answer}</code></p>{show && (index === config.correctReinforcement ? <CheckCircle2 size={20} /> : <X size={20} />)}</button> })}</div>{reinforcementAnswer !== null && <div className={`answer-feedback ${reinforcementAnswer === config.correctReinforcement ? 'correct' : 'wrong'}`}><p><strong>{reinforcementAnswer === config.correctReinforcement ? 'Верно!' : 'Попробуй ещё раз'}</strong><span>{reinforcementAnswer === config.correctReinforcement ? 'Навык закреплён на новом примере.' : 'Выполни команду по шагам.'}</span></p></div>}<button className="primary-button choice-next" disabled={!complete} onClick={() => go(5)}>Результат <Trophy size={17} /></button></div><aside className="rule-card"><Sparkles size={24} /><strong>Уже сложнее</strong><p>Здесь ты переносишь правило на новый пример без подсказки.</p></aside></div>
        )}

        {slide === 5 && (
          <div className="slide-content lesson-two-finish slide-enter"><div className="finish-emblem"><Trophy size={34} /></div><span className="section-tag"><Sparkles size={15} /> УРОК {config.number} ЗАВЕРШЁН</span><h2>{config.finishTitle}</h2><p className="lead">{config.finishLead}</p><div className="finish-stats"><div><Zap size={19} /><strong>+{config.xp} XP</strong><span>за урок</span></div><div><CheckCircle2 size={19} /><strong>4 задания</strong><span>выполнено</span></div></div><div className="summary-list">{config.skills.map((skill) => <p key={skill}><Check size={15} /> {skill}</p>)}</div>{onNext && <button className="primary-button finish-next" onClick={onNext}>{config.nextTitle} <ArrowRight size={17} /></button>}</div>
        )}
      </section>

      <div className="lesson-navigation"><button className="nav-button" disabled={slide === 0} onClick={() => go(slide - 1)}><ChevronLeft size={18} /> Назад</button><span>{slide + 1} / {lessonSlides.length}</span><button className="nav-button" disabled={slide === lessonSlides.length - 1 || !canOpen(slide + 1)} onClick={() => go(slide + 1)}>Далее <ChevronRight size={18} /></button></div>
    </>
  )
}

export default App

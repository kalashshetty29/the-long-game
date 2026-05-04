import { useState, useCallback, useEffect } from 'react'
import { Home, BookOpen, Target, Activity, TrendingUp, Wallet, Coins, Plus, BookMarked } from 'lucide-react'

import { useFinanceData } from './hooks/useFinanceData'
import { useLifeData } from './hooks/useLifeData'
import { getTimeOfDay } from './lib/time-of-day'
import { onAuthChange, isFirebaseConfigured } from './lib/storage'

import HomeView from './components/home/HomeView'
import Toast from './components/home/Toast'
import SignIn from './components/auth/SignIn'

// Finance space components
import Dashboard from './components/finance/Dashboard'
import Loans from './components/finance/Loans'
import Pool from './components/finance/Pool'
import Budget from './components/finance/Budget'
import Log from './components/finance/Log'
import Gear from './components/finance/Gear'
import Settings from './components/finance/Settings'

// Life space components
import Welcome from './components/life/Welcome'
import TodayView from './components/life/TodayView'
import BodyView from './components/life/BodyView'
import PlanView from './components/life/PlanView'
import LogView from './components/life/LogView'
import ProgressView from './components/life/ProgressView'

// ---- Top-level navigation tabs ----
const TOP_TABS = [
  { id: 'home',      label: 'Home',         icon: Home },
  { id: 'body-mind', label: 'Body & Mind',  icon: Target },
  { id: 'finance',   label: 'Finance',      icon: Wallet },
]

// ---- Sub-tabs per space ----
const FINANCE_SUB_TABS = [
  { id: 'dashboard', label: 'Home',   icon: Home },
  { id: 'loans',     label: 'Loans',  icon: Wallet },
  { id: 'log',       label: 'Log',    icon: Plus, primary: true },
  { id: 'budget',    label: 'Budget', icon: TrendingUp },
  { id: 'more',      label: 'More',   icon: Coins },
]

const LIFE_SUB_TABS = [
  { id: 'today',    label: 'Today',    icon: Target },
  { id: 'body',     label: 'Body',     icon: Activity },
  { id: 'plan',     label: 'Plan',     icon: BookOpen, primary: true },
  { id: 'log',      label: 'Log',      icon: BookMarked },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
]

const FINANCE_SUB_VIEWS = {
  loans: [
    { id: 'loans-list', label: 'Loans' },
    { id: 'pool',       label: 'Pool' },
  ],
  more: [
    { id: 'gear',     label: 'Gear plan' },
    { id: 'settings', label: 'Settings' },
  ],
}

export default function App() {
  // Top-level tab state
  const [topTab, setTopTab] = useState(() => localStorage.getItem('long-game-tab') || 'home')

  // Sub-tab state per space
  const [financeTab, setFinanceTab] = useState('dashboard')
  const [lifeTab, setLifeTab] = useState('today')
  const [loansSubView, setLoansSubView] = useState('loans-list')
  const [moreSubView, setMoreSubView] = useState('gear')

  // Toast state — for goal-completion feedback
  const [toast, setToast] = useState(null)

  // Auth state
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [firebaseEnabled, setFirebaseEnabled] = useState(false)
  const [skipSignIn, setSkipSignIn] = useState(() => localStorage.getItem('long-game-skip-signin') === '1')

  // Subscribe to auth changes
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const fbReady = await isFirebaseConfigured()
      if (!mounted) return
      setFirebaseEnabled(fbReady)
      if (!fbReady) {
        // No Firebase — local-only mode
        setAuthChecked(true)
        return
      }
      // Firebase is ready; subscribe to auth state
      const unsubscribe = onAuthChange((user) => {
        if (!mounted) return
        setAuthUser(user)
        setAuthChecked(true)
      })
      // Mark checked after a moment even if no callback fires (signed-out state)
      setTimeout(() => { if (mounted) setAuthChecked(true) }, 1500)
      return unsubscribe
    })()
    return () => { mounted = false }
  }, [])

  const finance = useFinanceData()
  const life = useLifeData()

  const changeTopTab = (next) => {
    setTopTab(next)
    localStorage.setItem('long-game-tab', next)
  }

  const navigate = useCallback((space, subTab) => {
    if (space === 'body-mind') {
      changeTopTab('body-mind')
      if (subTab) setLifeTab(subTab)
    } else if (space === 'finance') {
      changeTopTab('finance')
      if (subTab === 'pool' || subTab === 'loans-list') {
        setFinanceTab('loans')
        setLoansSubView(subTab === 'pool' ? 'pool' : 'loans-list')
      } else if (subTab === 'gear' || subTab === 'settings') {
        setFinanceTab('more')
        setMoreSubView(subTab)
      } else if (subTab) {
        setFinanceTab(subTab)
      }
    } else if (space === 'home') {
      changeTopTab('home')
    }
  }, [])

  const showToast = useCallback((msg) => setToast(msg), [])
  const dismissToast = useCallback(() => setToast(null), [])

  if (finance.loading || life.loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-50">
        <div className="text-ink-500 font-display italic">Loading…</div>
      </div>
    )
  }

  // If Firebase is enabled but no user is signed in (and they haven't chosen local-only)
  if (firebaseEnabled && !authUser && !skipSignIn) {
    return (
      <SignIn
        onSignedIn={(user) => setAuthUser(user)}
        onContinueLocal={() => {
          localStorage.setItem('long-game-skip-signin', '1')
          setSkipSignIn(true)
        }}
      />
    )
  }

  // If Life isn't started AND user is on body-mind tab, show Welcome
  const isLifeStarted = !!life.state?.startDate
  const showWelcome = topTab === 'body-mind' && !isLifeStarted

  const tod = getTimeOfDay()

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900">
      <Toast toast={toast} onDismiss={dismissToast} />

      <Header
        topTab={topTab}
        finance={finance}
        life={life}
        isLifeStarted={isLifeStarted}
        tod={tod}
      />

      {/* Sub-tab strips for body-mind and finance only */}
      {topTab === 'finance' && (
        <SubTabStrip tabs={FINANCE_SUB_TABS} activeTab={financeTab} onChange={setFinanceTab} />
      )}
      {topTab === 'body-mind' && isLifeStarted && (
        <SubTabStrip tabs={LIFE_SUB_TABS} activeTab={lifeTab} onChange={setLifeTab} />
      )}

      <main className="max-w-md mx-auto px-4 pt-3 pb-32">
        {topTab === 'home' && (
          <div className="grid gap-3">
            <HomeView life={life} finance={finance} navigate={navigate} showToast={showToast} />
          </div>
        )}

        {topTab === 'body-mind' && (
          <>
            {showWelcome ? (
              <Welcome onStart={life.actions.startJourney} />
            ) : (
              <LifeContent tab={lifeTab} life={life} />
            )}
          </>
        )}

        {topTab === 'finance' && (
          <FinanceContent
            tab={financeTab} finance={finance}
            loansSubView={loansSubView} setLoansSubView={setLoansSubView}
            moreSubView={moreSubView} setMoreSubView={setMoreSubView}
          />
        )}
      </main>

      {/* Top-level tab bar */}
      <TopTabBar activeTab={topTab} onChange={changeTopTab} />
    </div>
  )
}

// ---- Header ----
function Header({ topTab, finance, life, isLifeStarted, tod }) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const saving = finance.saving || life.saving

  // Greeting only on Home
  const showGreeting = topTab === 'home'

  return (
    <header className="sticky top-0 z-20 bg-paper-50/90 backdrop-blur-md border-b border-paper-200/60">
      <div className="max-w-md mx-auto px-4 pt-3 pb-2.5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-500 font-medium">
              {dateStr}
            </div>
            {showGreeting ? (
              <h1 className="font-display text-[24px] font-medium tracking-tight leading-[1.05] mt-0.5">
                {tod.greeting} <span className="italic font-normal text-ink-500">{tod.accent}</span>
              </h1>
            ) : (
              <h1 className="font-display text-[19px] font-semibold tracking-tight mt-0.5">
                {topTab === 'body-mind' ? 'Body & Mind' : topTab === 'finance' ? 'Money flow' : 'The Long Game'}
              </h1>
            )}
          </div>
          <div className="text-[10px] tracking-wider flex-shrink-0 mt-1">
            {saving && <span className="text-accent-blue">Saving…</span>}
            {!saving && finance.cloud && <span className="text-accent-green">● Synced</span>}
            {!saving && !finance.cloud && <span className="text-ink-500">● Local</span>}
          </div>
        </div>
      </div>
    </header>
  )
}

// ---- Top-level 3-tab bar ----
function TopTabBar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-paper-50/95 backdrop-blur-md border-t border-paper-200">
      <div className="max-w-md mx-auto px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around">
          {TOP_TABS.map(t => {
            const Icon = t.icon
            const active = t.id === activeTab
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  active ? 'text-ink-900' : 'text-ink-500'
                }`}
                aria-label={t.label}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ---- Secondary sub-tab strip (sits ABOVE top tab bar) ----
function SubTabStrip({ tabs, activeTab, onChange }) {
  return (
    <nav className="sticky top-[68px] z-10 bg-paper-50/90 backdrop-blur-md border-b border-paper-200/60">
      <div className="max-w-md mx-auto px-2 overflow-x-auto">
        <div className="flex items-center justify-around min-w-max">
          {tabs.map(t => {
            const Icon = t.icon
            const active = t.id === activeTab
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-colors min-w-[60px] ${
                  active ? 'text-ink-900 border-b-2 border-ink-900' : 'text-ink-500 border-b-2 border-transparent'
                }`}
                aria-label={t.label}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.6} />
                <span className="text-[11px] font-medium tracking-wide">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ---- Finance content ----
function FinanceContent({ tab, finance, loansSubView, setLoansSubView, moreSubView, setMoreSubView }) {
  const { data, derived, update, reset, cloud, saving } = finance

  if (tab === 'dashboard') return <Dashboard data={data} derived={derived} />
  if (tab === 'log')       return <Log data={data} update={update} />
  if (tab === 'budget')    return <Budget data={data} derived={derived} update={update} />

  if (tab === 'loans') {
    return (
      <div>
        <div className="flex gap-2 mb-3 px-1">
          {FINANCE_SUB_VIEWS.loans.map(sv => (
            <button
              key={sv.id}
              onClick={() => setLoansSubView(sv.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                loansSubView === sv.id ? 'bg-ink-900 text-paper-50' : 'bg-paper-100 text-ink-700'
              }`}
            >
              {sv.label}
            </button>
          ))}
        </div>
        {loansSubView === 'loans-list' && <Loans data={data} derived={derived} update={update} />}
        {loansSubView === 'pool' && <Pool data={data} update={update} />}
      </div>
    )
  }

  if (tab === 'more') {
    return (
      <div>
        <div className="flex gap-2 mb-3 px-1">
          {FINANCE_SUB_VIEWS.more.map(sv => (
            <button
              key={sv.id}
              onClick={() => setMoreSubView(sv.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                moreSubView === sv.id ? 'bg-ink-900 text-paper-50' : 'bg-paper-100 text-ink-700'
              }`}
            >
              {sv.label}
            </button>
          ))}
        </div>
        {moreSubView === 'gear' && <Gear data={data} derived={derived} update={update} />}
        {moreSubView === 'settings' && <Settings data={data} cloud={cloud} reset={reset} saving={saving} />}
      </div>
    )
  }

  return null
}

// ---- Life content ----
function LifeContent({ tab, life }) {
  const { state, derived, actions } = life

  if (tab === 'today') {
    return (
      <TodayView
        currentMonth={derived.currentMonth}
        currentMonthData={derived.currentMonthData}
        currentPhase={derived.currentPhase}
        weekOfMonth={derived.weekOfMonth}
        currentWeek={derived.currentWeek}
        currentWeekTask={derived.currentWeekTask}
        todayEntry={derived.todayEntry}
        updateDaily={actions.updateDaily}
        quote={derived.quote}
        dayOfWeek={derived.dayOfWeek}
        customGoals={state.customGoals}
        addCustomGoal={actions.addCustomGoal}
        toggleCustomGoal={actions.toggleCustomGoal}
        removeCustomGoal={actions.removeCustomGoal}
        studyStreak={derived.studyStreak}
        currentBook={state.currentBook}
        updateBook={actions.updateBook}
      />
    )
  }

  if (tab === 'body') {
    return (
      <BodyView
        todayEntry={derived.todayEntry}
        updateDaily={actions.updateDaily}
        dayOfWeek={derived.dayOfWeek}
        currentWeek={derived.currentWeek}
      />
    )
  }

  if (tab === 'plan') {
    return (
      <PlanView
        completedWeeks={state.completedWeeks}
        toggleWeek={actions.toggleWeek}
        checkpoints={state.checkpoints}
        toggleCheckpoint={actions.toggleCheckpoint}
        currentMonth={derived.currentMonth}
        reflections={state.reflections}
        updateReflection={actions.updateReflection}
      />
    )
  }

  if (tab === 'log') return <LogView dailyLog={state.dailyLog} />

  if (tab === 'progress') {
    return (
      <ProgressView
        studyStreak={derived.studyStreak}
        workoutStreak={derived.workoutStreak}
        readingStreak={derived.readingStreak}
        dailyLog={state.dailyLog}
        completedWeeksCount={Object.values(state.completedWeeks).filter(Boolean).length}
        daysSinceStart={derived.daysSinceStart}
        checkpoints={state.checkpoints}
        customGoals={state.customGoals}
        exportData={actions.exportData}
        importData={actions.importData}
      />
    )
  }

  return null
}

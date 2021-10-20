import styles from './App.module.scss'
import { LoginBox } from './components/LoginBox'
import { MessageList } from './components/MessageList'
import { SendMessageForm } from './components/SendMessageForm'
import { useAuth } from './hooks/useAuth'


export function App() {
  const { user } = useAuth()

  return (
    <div className="App">
      <main className={`${styles.contentWrapper} ${!!user ? styles.contentSigned : ''}`}>
        <MessageList />
        { !!user ? <SendMessageForm /> : <LoginBox /> }
      </main>
    </div>
  )
}


import styles from './styles.module.scss';

export function Toast() {
  return (
    <div className={styles.toastWrapper}>
      <div className={`${styles.toast} ${styles.toastSuccess}`}>
        Mensagem enviada com sucesso!
      </div>
    </div>
  )
}
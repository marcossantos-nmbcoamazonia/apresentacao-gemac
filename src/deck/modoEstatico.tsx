/**
 * Desliga animações de entrada onde elas atrapalham.
 *
 * A contagem animada dos números herói é boa na apresentação ao vivo e péssima
 * em dois lugares: na exportação em PDF, que captura o número no meio do
 * caminho, e nas miniaturas da grade, que renderizam dez slides de uma vez.
 * Nesses dois contextos o valor final aparece direto.
 */
import { createContext, useContext } from 'react'

export const ContextoModoEstatico = createContext(false)

export const useModoEstatico = (): boolean => useContext(ContextoModoEstatico)

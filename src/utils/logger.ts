import config from './config'

const empty = (..._params: any[]) => {}

const info = config.NODE_ENV !== 'test'? (...params: any[]) => {
    console.log(...params)
} : empty

const error = config.NODE_ENV !== 'test'? (...params: any[]) => {
    console.error(...params)
} : empty

export default {
    info, error
}

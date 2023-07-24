import {RxStompConfig} from '@stomp/rx-stomp'

const login = localStorage.getItem('key')
const ifStmnt = login === null || login === undefined

export const myRxStompConfig: RxStompConfig = {
  // Which server?
  brokerURL: 'ws://127.0.0.1:8085/api/ws',

  // Headers
  // Typical keys: login, passcode, host

  connectHeaders: {
    login: ifStmnt ? "df8932d9-676c-4053-8d05-3ab505c30291" : "231c7610-b045-41f9-8ab3-d29e469541b7",
    passcode: 'guest',
  },

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  // Wait in milliseconds before attempting auto reconnect
  // Set to 0 to disable
  // Typical value 500 (500 milli seconds)
  reconnectDelay: 2000,

  // Will log diagnostics on console
  // It can be quite verbose, not recommended in production
  // Skip this key to stop logging to console
  debug: (msg: string): void => {
    console.log(new Date(), msg)
  },
}

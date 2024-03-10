import axios from 'axios'
import { useState } from 'react'

function App(): JSX.Element {
  const loggedUser = localStorage.getItem('user')
  const loggedTokens = localStorage.getItem('tokens')
  const [logged, setLogged] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const payload = Object.fromEntries(new FormData(e.currentTarget))

    const api_login = 'https://tsec.blvckdev.homes/api/v1/auth/login'

    try {
      const result: { user: Record<string, string>; tokens: Record<string, string> } = await (
        await axios.post(api_login, payload)
      ).data
      if (result) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('tokens', JSON.stringify(result.tokens))
        setLogged(true)
      }
    } catch (error) {
      setLogged(false)
      alert('Invalid Credentials !!!')
    }
  }

  if ((loggedUser && loggedTokens) || logged) {
    return <Logged />
  } else {
    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img className="mx-auto h-36 w-auto" src="src/assets/logo.png" alt="Your Company" />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="mt-6 text-sm text-orange-500 bg-orange-50 border border-orange-200 rounded-lg p-3">
              You must have an account to use this app. If not{' '}
              <a
                href="https://t-sec.blvckdev.homes/signup"
                target="_blank"
                rel="noreferrer"
                className="font-semibold leading-6 underline hover:text-indigo-500"
              >
                click here
              </a>{' '}
              to download the mobile app and sign yourself up.
            </p>
          </div>
        </div>
      </>
    )
  }
}

function Logged(): JSX.Element {
  const user = JSON.parse(localStorage.getItem('user') || '')
  const tokens = JSON.parse(localStorage.getItem('tokens') || '')

  const lockScreen = (): void => window.electron.ipcRenderer.send('lock-screen')

  setInterval(() => {
    axios
      .get('https://tsec.blvckdev.homes/api/v1/events', {
        headers: {
          Authorization: `Bearer ${tokens.access.token}`
        }
      })
      .then((res) => {
        const results = res.data.results
        const commands = results.filter((result) => result.author === user.id)
        const command_to_exec = commands[commands.length - 1]
        // const last_command_hash = localStorage.getItem('last_command') || null
        // if (last_command_hash === null) {
        //   localStorage.setItem('last_command', JSON.stringify(command_to_exec))
        // }
        switch (command_to_exec.type) {
          case 'lock':
            // if (last_command_hash !== JSON.stringify(command_to_exec)) lockScreen()
            lockScreen()
            break

          default:
            break
        }
      })
  }, 1500)

  return (
    <main className="p-6">
      <img
        src="../src/assets/logo.png"
        alt="RemoteLock"
        width={130}
        height={130}
        className="mx-auto"
      />

      <h1 className="text-2xl font-extrabold tracking-tight mt-6">Informations</h1>
      <div className="p-3 rounded-xl border border-teal-500 bg-teal-50 mt-2">
        <p className="text-xs rounded-lg">
          ID: {(user.id.slice(0, 4) as string).padEnd(user.id.length - 4, '*')}
        </p>
        <p className="text-xs rounded-lg mt-1.5">Firstname: {user.firstname}</p>
        <p className="text-xs rounded-lg mt-1.5">Lastname: {user.lastname}</p>
        <p className="text-xs rounded-lg inline-flex items-center gap-2">
          <span>Status:</span>
          <div className="inline-flex gap-x-1 items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Active</span>
          </div>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={lockScreen}
          className="p-2 rounded-full bg-orange-50 flex items-center justify-center gap-x-2 border border-orange-300 shadow duration-500 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            color="#000000"
            fill="none"
          >
            <path
              d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M15.2248 17.8251L17.2154 15.8824M17.2154 15.8824L18.6262 14.5248C18.9498 14.249 19.5998 13.6034 20.3728 14.3431L21.9998 15.8824M17.2154 15.8824L18.8248 17.4277M15.4998 19.7696C15.4998 21.0136 14.4909 22 13.255 22C12.0192 22 10.9998 21.0136 10.9998 19.7696C10.9998 18.5256 12.0192 17.5259 13.255 17.5259C14.4909 17.5259 15.4998 18.5256 15.4998 19.7696Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xs">Lock Screen</span>
        </button>
        <button
          onClick={() => {
            console.log(localStorage.getItem('user'))
            console.log(localStorage.getItem('tokens'))
          }}
          className="p-2 rounded-full bg-red-50 flex items-center justify-center gap-x-2 border border-red-300 shadow duration-500 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            color="#000000"
            fill="none"
          >
            <path
              d="M7.02331 5.5C4.59826 7.11238 3 9.86954 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 9.86954 19.4017 7.11238 16.9767 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M12 2V10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs">Quit</span>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <button
          onClick={() => {
            localStorage.removeItem('user')
            localStorage.removeItem('tokens')
            localStorage.clear()
            window.location.reload()
            lockScreen()
          }}
          className="p-2 rounded-full bg-gray-50 flex items-center justify-center gap-x-2 border border-gray-300 shadow duration-500 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={22}
            height={22}
            color={'#000000'}
            fill={'none'}
          >
            <path
              d="M15 17.625C14.9264 19.4769 13.3831 21.0494 11.3156 20.9988C10.8346 20.987 10.2401 20.8194 9.05112 20.484C6.18961 19.6768 3.70555 18.3203 3.10956 15.2815C3 14.723 3 14.0944 3 12.8373L3 11.1627C3 9.90561 3 9.27705 3.10956 8.71846C3.70555 5.67965 6.18961 4.32316 9.05112 3.51603C10.2401 3.18064 10.8346 3.01295 11.3156 3.00119C13.3831 2.95061 14.9264 4.52307 15 6.37501"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M21 12H10M21 12C21 11.2998 19.0057 9.99153 18.5 9.5M21 12C21 12.7002 19.0057 14.0085 18.5 14.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </main>
  )
}

export default App

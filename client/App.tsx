import { useState } from 'react'
import { DatePicker } from "@chakra-ui/react"
import { TextInput } from './components/TextInput'

function App() {
  const [ projectName, setProjectName ] = useState("")
  const [ yarnName, setYarnName ] = useState("")
  const [ yarnGauge, setYarnGauge ] = useState("")
  const [ yarnMaterial, setYarnMaterial ] = useState("")
  const [ yarnColor, setYarnColor ] = useState("")
  const [ startDate, setStartDate ] = useState("")

  /*const handleSubmit = (e : React.SubmitEvent<HTMLFormElement>) => { e.preventDefault()
    //do some stuff here to save the file to a local
  }

  const handleImport = (e : React.SubmitEvent<HTMLFormElement>) => { e.preventDefault()
    //do some stuff here to do stuff to import a file
  }*/

  return (
    <div className = "base">
      <h1>Hookbook</h1>
      <form>
        <fieldset>
          <div>
            <label>
              Name your project
            </label>
            <TextInput name="projectname" value={projectName} onChange={setProjectName} placeholder="Project Name?" required />
          </div>
          <div>
            <label>
              Label your yarn as best as possible
            </label>
            <TextInput name="yarnname" value={yarnName} onChange={setYarnName} placeholder="Enter yarn brand or make something up" />
            <TextInput name="yarngauge" value={yarnGauge} onChange={setYarnGauge} placeholder="Yarn weight" required />
            <TextInput name="yarnmaterial" value={yarnMaterial} onChange={setYarnMaterial} placeholder="Yarn material" />
            <TextInput name="yarncolor" value={yarnColor} onChange={setYarnColor} placeholder="Yarn color" required />
          </div>
          <div>
            <label>
              When did you start?
            </label>
            {/* add a component library here, b */}
            <TextInput name="startdate" value={startDate} onChange={setStartDate} placeholder="Date today?" required />
          </div>
        </fieldset>
      </form>

    </div>
  )
}

export default App

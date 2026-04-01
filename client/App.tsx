import { useState } from 'react'

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
            {/* make a labeled input component */}
            <input type="text" name="projectname" id="projectname" value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name?" required/>
          </div>
          <div>
            <label>
              Label your yarn as best as possible
            </label>
            <input type="text" name="yarnname" id="yarnname" value={yarnName} 
              onChange={(e) => setYarnName(e.target.value)} placeholder="Enter yarn brand or a make something up"/>
            <input type="text" name="yarngauge" id="yarngauge" value={yarnGauge} 
              onChange={(e) => setYarnGauge(e.target.value)} placeholder="Yarn weight" required/>
            <input type="text" name="yarnmaterial" id="yarnmaterial" value={yarnMaterial} 
              onChange={(e) => setYarnMaterial(e.target.value)} placeholder="Yarn material"/>
            <input type="text" name="yarncolor" id="yarncolor" value={yarnColor} 
              onChange={(e) => setYarnColor(e.target.value)} placeholder="Yarn color" required/>
          </div>
          <div>
            <label>
              When did you start?
            </label>
            {/* add a component library here, b */}
            <input type="text" name="startdate" id="startdate" value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} placeholder="Date today?" required/>
          </div>
        </fieldset>
      </form>

    </div>
  )
}

export default App

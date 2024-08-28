import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'

import {
  getOrcamentoEng,
  getOrcamentoArqCasa,
  getOrcamentoMetragram
} from './calc'

import { ImSpinner2 } from 'react-icons/im'
// import { FaCircleCheck } from 'react-icons/fa6'
import { TbFaceIdError } from 'react-icons/tb'
import { Input } from './components/Input'
import { Button } from './components/Button'
import { CounterInput } from './components/CounterInput'
import { InputSelect } from './components/InputSelect'
import { InputMultiSelect } from './components/InputMultiSelect'
import { StepMarker } from './components/StepMarker'

// Função para validar número de telefone
const validatePhoneNumber = (phone) => {
  const regex = /^\(\d{2}\) \d \d{4}-\d{4}$/
  return regex.test(phone)
}

// Função para formatar número de telefone
const formatPhoneNumber = (phone) => {
  phone = phone.replace(/[^\d]+/g, '')
  if (phone.length > 11) phone = phone.slice(0, 11)
  if (phone.length > 6)
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 3)} ${phone.slice(3, 7)}-${phone.slice(7)}`
  if (phone.length > 2) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`
  return phone
}

// const encode = (data) => {
//   return Object.keys(data)
//     .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
//     .join('&')
// }

const InfoDataSchema = z.object({
  whatsapp: z.string().refine(validatePhoneNumber, {
    message: 'Número de telefone inválido. Use o formato (99) 9 1111-1111'
  }),
  nome: z.string().min(1, 'Campo obrigatório.'),
  email: z.string().min(1, 'Campo obrigatório.'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos'
  })
})

const PropDataSchema = z.object({
  tipoDeOrcamento: z.string().min(1, 'Campo obrigatório.'),
  tipoImovel: z.string().min(1, 'Campo obrigatório.'),
  tipoDeObra: z.string().min(1, 'Campo obrigatório.')
})

const haveProjectSchema = z.object({
  temProjetoArquitetonico: z.string().min(1, 'Campo obrigatório.')
})

const projectsSchema = z.object({
  projects: z.string().min(1, 'Campo obrigatório.')
})

const metragemSchema = z.object({
  metragem: z
    .string()
    .min(1, 'Campo obrigatório.')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Valor inválido'
    })
})

const OptionsDataSchema = z.object({
  tempoParaIniciarAObra: z.string().min(1, 'Campo obrigatório.')
})

function App() {
  const [step, setStep] = useState(0)
  const [result, setResult] = useState(0)
  const [metragemResult, setMetragemResult] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const {
    register: infoRegister,
    watch: watchInfoValue,
    setValue: setInfoValue,
    handleSubmit: handleInfoSubmit,
    getValues: getInfoValues,
    formState: { errors: infoErrors }
  } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      acceptTerms: false
    },
    resolver: zodResolver(InfoDataSchema)
  })

  const {
    handleSubmit: handlePropSubmit,
    getValues: getPropValues,
    formState: { errors: propErrors },
    watch: watchPropValue,
    setValue: setPropValue
  } = useForm({
    defaultValues: {
      tipoDeObra: '',
      tipoDeOrcamento: '',
      tipoImovel: ''
    },
    resolver: zodResolver(PropDataSchema)
  })

  const {
    handleSubmit: handleHaveProjectSubmit,
    // getValues: getHaveProjectValues,
    formState: { errors: haveProjectErrors },
    setValue: setHaveProjectValue,
    watch: watchHaveProjectValue
  } = useForm({
    defaultValues: {
      temProjetoArquitetonico: ''
    },
    resolver: zodResolver(haveProjectSchema)
  })

  const {
    handleSubmit: handleProjectsSubmit,
    getValues: getProjectsValues,
    formState: { errors: projectsErrors },
    setValue: setProjectsValue,
    watch: watchProjectsValue
  } = useForm({
    defaultValues: {
      projects: ''
    },
    resolver: zodResolver(projectsSchema)
  })

  const {
    register: metragemRegister,
    handleSubmit: handleMetragramSubmit,
    getValues: getMetragramValues,
    formState: { errors: MetragramErrors }
    // setValue: setMetragramValue,
    // watch: watchMetragramValue
  } = useForm({
    defaultValues: {
      metragem: ''
    },
    resolver: zodResolver(metragemSchema)
  })

  const {
    handleSubmit: handleAmountSubmit,
    watch: watchAmoutValue,
    getValues: getAmoutValue,
    setValue: setAmountValue
  } = useForm({
    defaultValues: {
      suiteMaster: 0,
      suite: 0,
      quarto: 0,
      salaDeEstar: 0,
      escritorio: 0,
      cozinha: 0,
      salaDeJantar: 0,
      lavabo: 0,
      home: 0,
      areaGourmet: 0,
      garagemCoberta: 0,
      roupeiro: 0,
      deposito: 0,
      piscina: 0
    }
  })

  const {
    handleSubmit: handleOptionsSubmit,
    setValue: setOptionsValue,
    getValues: getOptionsValue,
    watch: watchOptionsValue,
    formState: { errors: optionsErrors }
  } = useForm({
    defaultValues: {
      tempoParaIniciarAObra: ''
    },
    resolver: zodResolver(OptionsDataSchema)
  })

  const phoneNumberValue = watchInfoValue('whatsapp')
  const projectType = watchPropValue('tipoDeOrcamento')
  const haveProject = watchHaveProjectValue('temProjetoArquitetonico')
  const projects = watchProjectsValue('projects')

  useEffect(() => {
    setInfoValue('whatsapp', formatPhoneNumber(phoneNumberValue))
  }, [phoneNumberValue, setInfoValue])

  const handleSubmitForm = async () => {
    setSubmitting(true)
    setStep((e) => e + 1)
    const infoData = getInfoValues()
    const propData = getPropValues()
    const amoutData = getAmoutValue()
    const optionsData = getOptionsValue()
    const projectsData = getProjectsValues()
    const metragremData = getMetragramValues()
    const metragemValue =
      metragremData.metragem < 25
        ? 100
        : metragremData.metragem < 100
          ? 80
          : metragremData.metragem < 200
            ? 60
            : 50
    let result = 0
    let message = ''
    if (propData.tipoDeOrcamento === 'Projeto Arquitetônico') {
      if (
        propData.tipoImovel === 'Casa' &&
        propData.tipoDeObra === 'Construção'
      ) {
        const { metragemTotal, value } = getOrcamentoArqCasa(
          amoutData,
          metragemValue
        )
        result = value
        setMetragemResult(metragemTotal)
        message = `
          name: ${infoData.nome}
          email: ${infoData.email}
          whatsapp: ${infoData.whatsapp}
          tipoDeOrçamento: ${propData.tipoDeOrcamento.toString()}
          tipoDeObra: ${propData.tipoDeObra.toString()}
          tipoDeImóvel: ${propData.tipoImovel.toString()}
          metrosDoProjeto: ${metragremData.metragem}
          suiteMaster: ${amoutData.suiteMaster.toString()}
          suite: ${amoutData.suite.toString()}
          quarto: ${amoutData.quarto.toString()}
          salaDeEstar: ${amoutData.salaDeEstar.toString()}
          escritorio: ${amoutData.escritorio.toString()}
          cozinha: ${amoutData.cozinha.toString()}
          salaDeJantar: ${amoutData.salaDeJantar.toString()}
          lavabo: ${amoutData.lavabo.toString()}
          home: ${amoutData.home.toString()}
          areaGourmet: ${amoutData.areaGourmet.toString()}
          garagemCoberta: ${amoutData.garagemCoberta.toString()}
          roupeiro: ${amoutData.roupeiro.toString()}
          deposito: ${amoutData.deposito.toString()}
          piscina: ${amoutData.piscina.toString()}
          tempoParaOProjeto: ${optionsData.tempoParaIniciarAObra}
          orçamento: ${result}
      `
      } else {
        result = getOrcamentoMetragram(metragremData.metragem, metragemValue)
        message = `
          name: ${infoData.nome}
          email: ${infoData.email}
          whatsapp: ${infoData.whatsapp}
          tipoDeOrçamento: ${propData.tipoDeOrcamento.toString()}
          tipoDeImóvel: ${propData.tipoImovel.toString()}
          tipoDeObra: ${propData.tipoDeObra.toString()}
          metrosDoProjeto: ${metragremData.metragem}
          tempoParaOProjeto: ${optionsData.tempoParaIniciarAObra}
          orçamento: ${result}
      `
      }
    } else {
      const projectCount = projectsData.projects.split(',').length
      const engValue = metragremData.metragem >= 200 ? 15 : 20
      result = getOrcamentoEng(projectCount, engValue, metragremData.metragem)
      message = `
          name: ${infoData.nome}
          email: ${infoData.email}
          whatsapp: ${infoData.whatsapp}
          tipoDeOrçamento: ${propData.tipoDeOrcamento.toString()}
          tipoDeImóvel: ${propData.tipoImovel.toString()}
          tipoDeObra: ${propData.tipoDeObra.toString()}
          metrosDoProjeto: ${metragremData.metragem}
          projetos: ${projectsData.projects}
          suiteMaster: ${amoutData.suiteMaster.toString()}
          suite: ${amoutData.suite.toString()}
          quarto: ${amoutData.quarto.toString()}
          salaDeEstar: ${amoutData.salaDeEstar.toString()}
          escritorio: ${amoutData.escritorio.toString()}
          cozinha: ${amoutData.cozinha.toString()}
          salaDeJantar: ${amoutData.salaDeJantar.toString()}
          lavabo: ${amoutData.lavabo.toString()}
          home: ${amoutData.home.toString()}
          areaGourmet: ${amoutData.areaGourmet.toString()}
          garagemCoberta: ${amoutData.garagemCoberta.toString()}
          roupeiro: ${amoutData.roupeiro.toString()}
          deposito: ${amoutData.deposito.toString()}
          piscina: ${amoutData.piscina.toString()}
          tempoParaOProjeto: ${optionsData.tempoParaIniciarAObra}
          orçamento: ${result}
      `
    }
    setResult(result)

    // const encodedData = encode({
    //   'form-name': 'contact',
    //   nome: infoData.nome,
    //   name: infoData.nome,
    //   email: infoData.email,
    //   message: message
    // })
    try {
      // const response = await fetch('/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: encodedData
      // })

      // if (response.status !== 200) {
      //   setSubmitError(true)
      // }
      console.log(message)
    } catch (err) {
      setSubmitError(true)
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  const shouldShowMetragem =
    watchPropValue('tipoDeOrcamento') === 'Projeto Arquitetônico' &&
    watchPropValue('tipoImovel') === 'Casa' &&
    watchPropValue('tipoDeObra') === 'Construção'

  let currentForm
  if (step === 0) {
    currentForm = (
      <motion.div
        key="step-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 flex flex-col items-center gap-10">
          <img src="./newwhite.svg" alt="logo" className="w-[200px]" />
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-semibold text-center text-2xl text-[#61794a]/90">
              Calculadora de orçamento de projetos em 3D
            </h1>
            <p className="font-normal text-[#61794a]/90">
              Tempo de preenchimento: 3 minutos
            </p>
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button
              label="INICIAR"
              type="button"
              buttonAction={() => setStep(1)}
            />
          </div>
        </div>
      </motion.div>
    )
  } else if (step === 1) {
    currentForm = (
      <motion.div
        key="step-2"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleInfoSubmit(() => setStep((e) => e + 1))}>
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <Input
              id={'nome'}
              label={'Nome'}
              required
              register={infoRegister}
              error={infoErrors.nome}
            />
            <Input
              id={'email'}
              label={'Seu melhor email'}
              required
              register={infoRegister}
              error={infoErrors.email}
            />
            <Input
              id={'whatsapp'}
              label={'Whatsapp'}
              required
              register={infoRegister}
              error={infoErrors.whatsapp}
            />
            <p className="text-neutral-100">
              *O seu orçamento será enviado por whatsapp
            </p>
            <div className="w-full flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...infoRegister('acceptTerms')}
                className="w-5 h-5 cursor-pointer accent-[#61794a] mt-1  "
                style={{
                  backgroundColor: 'rgb(244 63 94)'
                }}
              />
              <label
                htmlFor="acceptTerms"
                className="text-xs sm:text-lg text-center cursor-pointer text-[#61794a]/90"
              >
                Ao selecionar essa opção você aceita receber informações da AGE
                nos contatos informados acima
              </label>
            </div>
          </div>
          {infoErrors.acceptTerms && (
            <div className="text-red-500 w-full text-center my-1">
              {infoErrors.acceptTerms.message}
            </div>
          )}
          <div className="w-full flex gap-4 px-4">
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 2) {
    currentForm = (
      <motion.div
        key="step-3"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handlePropSubmit(() => {
            if (projectType === 'Projeto Arquitetônico') {
              if (
                watchPropValue('tipoImovel') === 'Casa' &&
                watchPropValue('tipoDeObra') !== 'Reforma'
              ) {
                return setStep((e) => e + 1)
              }
              return setStep((e) => e + 1.5)
            }
            setStep((e) => e + 0.5)
          })}
        >
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Casa', value: 'Casa' },
                { label: 'Apartamento', value: 'Apartamento' },
                { label: 'Comercial', value: 'Comercial' }
              ]}
              onChange={(e) => setPropValue('tipoImovel', e)}
              value={watchPropValue('tipoImovel')}
              error={propErrors.tipoImovel}
              label="Tipo de imóvel?"
            />
            <InputSelect
              options={[
                { label: 'Reforma', value: 'Reforma' },
                { label: 'Construção', value: 'Construção' }
              ]}
              onChange={(e) => setPropValue('tipoDeObra', e)}
              value={watchPropValue('tipoDeObra')}
              error={propErrors.tipoDeObra}
              label="Tipo de obra?"
            />
            <InputSelect
              options={[
                {
                  label: 'Projeto Arquitetônico',
                  value: 'Projeto Arquitetônico'
                },
                {
                  label: 'Projeto Essencial de Engenharia',
                  value: 'Projeto Essencial de Engenharia'
                }
              ]}
              onChange={(e) => setPropValue('tipoDeOrcamento', e)}
              value={watchPropValue('tipoDeOrcamento')}
              error={propErrors.tipoDeOrcamento}
              label="Tipo de orçamento?"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-12">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 1)}
            />
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 2.5) {
    currentForm = (
      <motion.div
        key="step-2.5"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handleHaveProjectSubmit(() => {
            if (haveProject === 'Sim') {
              return setStep((e) => e + 0.2)
            }
            setHaveProjectValue('temProjetoArquitetonico', '')
            setPropValue('tipoDeOrcamento', 'Projeto Arquitetônico')
            setStep((e) => e - 0.5)
          })}
        >
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Sim', value: 'Sim' },
                { label: 'Não', value: 'Não' }
              ]}
              onChange={(e) =>
                setHaveProjectValue('temProjetoArquitetonico', e)
              }
              value={haveProject}
              error={haveProjectErrors.temProjetoArquitetonico}
              label="Tem projeto Arquitetônico?"
            />
          </div>
          {haveProject === 'Não' && (
            <div className="text-red-500 w-full px-2 text-center my-1">
              Não execultamos projeto de engenharia sem projeto de arquitetura
            </div>
          )}
          <div className="w-full flex gap-4 px-4 mt-12">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 0.5)}
            />
            <Button
              label={haveProject === 'Não' ? 'Entendi!' : 'Próximo'}
              type="submit"
            />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 2.7) {
    currentForm = (
      <motion.div
        key="step-2.7"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handleProjectsSubmit(() => {
            setStep((e) => e + 0.3)
          })}
        >
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <InputMultiSelect
              options={[
                { label: 'Elétrico', value: 'Elétrico' },
                { label: 'Hidraulico', value: 'Hidraulico' },
                { label: 'Hidrossanitário', value: 'Hidrossanitário' },
                { label: 'Águas Pluvias', value: 'Águas Pluvias' }
              ]}
              onChange={(e) => {
                e.length > 0
                  ? setProjectsValue(
                      'projects',
                      e.map((v) => v.value).join(',')
                    )
                  : setProjectsValue('projects', null)
              }}
              value={
                projects
                  ? projects.split(',').map((v) => ({ label: v, value: v }))
                  : undefined
              }
              error={projectsErrors.projects}
              label="Selecione os projetos"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-28">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 0.2)}
            />
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 3) {
    currentForm = (
      <motion.form
        key="step-4"
        onSubmit={handleAmountSubmit(() => {
          if (projectType === 'Projeto Arquitetônico') {
            return setStep((e) => e + 1)
          }
          setStep((e) => e + 0.5)
        })}
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{
          opacity: 1,
          y: 0,
          height: 'fit-content'
        }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 grid grid-col-1 sm:grid-cols-2 gap-2 sm:overflow-auto sm:max-h-[60vh]">
          <CounterInput
            title={`Suíte Master ${shouldShowMetragem ? '- 35m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('suiteMaster')}
            onAdd={() => {
              const currentAmout = getAmoutValue('suiteMaster')
              if (currentAmout < 5) {
                setAmountValue('suiteMaster', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('suiteMaster')
              if (currentAmout > 0) {
                setAmountValue('suiteMaster', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Suíte ${shouldShowMetragem ? '- 30m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('suite')}
            onAdd={() => {
              const currentAmout = getAmoutValue('suite')
              if (currentAmout < 5) {
                setAmountValue('suite', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('suite')
              if (currentAmout > 0) {
                setAmountValue('suite', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Quarto ${shouldShowMetragem ? '- 16m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('quarto')}
            onAdd={() => {
              const currentAmout = getAmoutValue('quarto')
              if (currentAmout < 5) {
                setAmountValue('quarto', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('quarto')
              if (currentAmout > 0) {
                setAmountValue('quarto', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Sala de estar ${shouldShowMetragem ? '- 20m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('salaDeEstar')}
            onAdd={() => {
              const currentAmout = getAmoutValue('salaDeEstar')
              if (currentAmout < 5) {
                setAmountValue('salaDeEstar', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('salaDeEstar')
              if (currentAmout > 0) {
                setAmountValue('salaDeEstar', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Escritório ${shouldShowMetragem ? '- 16m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('escritorio')}
            onAdd={() => {
              const currentAmout = getAmoutValue('escritorio')
              if (currentAmout < 5) {
                setAmountValue('escritorio', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('escritorio')
              if (currentAmout > 0) {
                setAmountValue('escritorio', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Cozinha ${shouldShowMetragem ? '- 20m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('cozinha')}
            onAdd={() => {
              const currentAmout = getAmoutValue('cozinha')
              if (currentAmout < 5) {
                setAmountValue('cozinha', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('cozinha')
              if (currentAmout > 0) {
                setAmountValue('cozinha', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Sala de jantar ${shouldShowMetragem ? '- 20m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('salaDeJantar')}
            onAdd={() => {
              const currentAmout = getAmoutValue('salaDeJantar')
              if (currentAmout < 5) {
                setAmountValue('salaDeJantar', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('salaDeJantar')
              if (currentAmout > 0) {
                setAmountValue('salaDeJantar', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Lavabo ${shouldShowMetragem ? '- 3m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('lavabo')}
            onAdd={() => {
              const currentAmout = getAmoutValue('lavabo')
              if (currentAmout < 5) {
                setAmountValue('lavabo', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('lavabo')
              if (currentAmout > 0) {
                setAmountValue('lavabo', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Home ${shouldShowMetragem ? '- 16m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('home')}
            onAdd={() => {
              const currentAmout = getAmoutValue('home')
              if (currentAmout < 5) {
                setAmountValue('home', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('home')
              if (currentAmout > 0) {
                setAmountValue('home', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Área gourmet ${shouldShowMetragem ? '- 40m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('areaGourmet')}
            onAdd={() => {
              const currentAmout = getAmoutValue('areaGourmet')
              if (currentAmout < 5) {
                setAmountValue('areaGourmet', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('areaGourmet')
              if (currentAmout > 0) {
                setAmountValue('areaGourmet', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Garagem Coberta ${shouldShowMetragem ? '- 20m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('garagemCoberta')}
            onAdd={() => {
              const currentAmout = getAmoutValue('garagemCoberta')
              if (currentAmout < 5) {
                setAmountValue('garagemCoberta', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('garagemCoberta')
              if (currentAmout > 0) {
                setAmountValue('garagemCoberta', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Roupeiro ${shouldShowMetragem ? '- 5m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('roupeiro')}
            onAdd={() => {
              const currentAmout = getAmoutValue('roupeiro')
              if (currentAmout < 5) {
                setAmountValue('roupeiro', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('roupeiro')
              if (currentAmout > 0) {
                setAmountValue('roupeiro', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Depósito ${shouldShowMetragem ? '- 6m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('deposito')}
            onAdd={() => {
              const currentAmout = getAmoutValue('deposito')
              if (currentAmout < 5) {
                setAmountValue('deposito', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('deposito')
              if (currentAmout > 0) {
                setAmountValue('deposito', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title={`Piscina ${shouldShowMetragem ? '- 40m²' : ''}`}
            subtitle="Quantidade"
            value={watchAmoutValue('piscina')}
            onAdd={() => {
              const currentAmout = getAmoutValue('piscina')
              if (currentAmout < 5) {
                setAmountValue('piscina', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('piscina')
              if (currentAmout > 0) {
                setAmountValue('piscina', currentAmout - 1)
              }
            }}
          />
        </div>
        <div className="w-full flex gap-4 px-4 mt-10">
          <Button
            outline
            label="Voltar"
            type="back"
            buttonAction={() => {
              if (projectType === 'Projeto Arquitetônico') {
                return setStep((e) => e - 1)
              }
              setStep((e) => e - 0.3)
            }}
          />
          <Button label="Próximo" type="submit" />
        </div>
      </motion.form>
    )
  } else if (step === 3.5) {
    currentForm = (
      <motion.div
        key="step-3.5"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handleMetragramSubmit(() => {
            setStep((e) => e + 0.5)
          })}
        >
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <Input
              id={'metragem'}
              label={'Qual a metragem do imóvel? (em m²)'}
              required
              register={metragemRegister}
              error={MetragramErrors.metragem}
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-12">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => {
                if (projectType === 'Projeto Arquitetônico') {
                  if (
                    watchPropValue('tipoImovel') === 'Casa' &&
                    watchPropValue('tipoDeObra') !== 'Reforma'
                  ) {
                    return setStep((e) => e - 0.5)
                  }
                  return setStep((e) => e - 1.5)
                }
                setStep((e) => e - 0.5)
              }}
            />
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 4) {
    currentForm = (
      <motion.div
        key="step-5"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleOptionsSubmit(handleSubmitForm)}>
          <div className="p-3 mt-10 sm:p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Em até 15 dias', value: 'Em até 15 dias' },
                { label: 'Em até 30 dias', value: 'Em até 30 dias' },
                { label: 'Em até 45 dias', value: 'Em até 45 dias' }
              ]}
              onChange={(e) => setOptionsValue('tempoParaIniciarAObra', e)}
              value={watchOptionsValue('tempoParaIniciarAObra')}
              error={optionsErrors.tempoParaIniciarAObra}
              label="Quando começa o projeto?"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-20">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => {
                if (projectType === 'Projeto Arquitetônico') {
                  if (
                    watchPropValue('tipoDeObra') === 'Casa' &&
                    watchPropValue('tipoDeObra') !== 'Reforma'
                  ) {
                    return setStep((e) => e - 1)
                  } else if (
                    watchPropValue('tipoImovel') === 'Casa' &&
                    watchPropValue('tipoDeObra') === 'Reforma'
                  ) {
                    return setStep((e) => e - 0.5)
                  } else if (watchPropValue('tipoImovel') !== 'Casa') {
                    return setStep((e) => e - 0.5)
                  }
                  return setStep((e) => e - 1)
                } else if (projectType !== 'Projeto Arquitetônico') {
                  return setStep((e) => e - 0.5)
                }
                setStep((e) => e - 1)
              }}
            />
            <Button label="Ver orçamento" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else {
    currentForm = (
      <motion.div
        key="step-6"
        initial={{ opacity: 0, y: 20, height: 450 }}
        animate={{ opacity: 1, y: 0, height: 450 }}
        exit={{ opacity: 0, y: 20, height: 450 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full flex items-center justify-center p-10 "
      >
        {submitting ? (
          <div className="flex flex-col gap-2 items-center justify-center min-h-[350px] transition-all ">
            <ImSpinner2 size={150} className="text-[#61794a] animate-spin" />
            <p className="text-[#61794a] text-center">
              Calculando orçamento...
            </p>
          </div>
        ) : submitError ? (
          <div className="flex flex-col gap-2 items-center justify-center min-h-[350px] transition-all">
            <TbFaceIdError size={150} className="text-rose-500" />
            <p className="text-rose-500 text-2xl font-light text-center">
              Infelizmente algo deu errado, tente mais tarde!
            </p>
          </div>
        ) : (
          // <div className="flex flex-col gap-2 items-center justify-center min-h-[350px] transition-all">
          //   <FaCircleCheck size={150} className="text-blue-500" />
          //   <p className="text-white font-semibold text-2xl text-center">
          //     Informações enviadas!
          //   </p>
          //   <p className="text-white font-semibold text-lg text-center">
          //     Enviaremos seu orçamento no whats app informado
          //   </p>
          // </div>
          <div className="flex flex-col gap-2 sm:gap-6 items-center justify-center min-h-[350px] transition-all">
            <img
              src="./newwhite.svg"
              alt="logo"
              className="w-[150px] h-[150px] -mt-10"
            />
            <div className="flex flex-col justify-center items-center gap-2">
              <h1 className="text-[#61794a]/70 text-xl sm:text-2xl font-bold text-center">
                Seu orçamento final: R$ {result},00
              </h1>
              {metragemResult !== 0 && (
                <h1 className="text-[#61794a]/70 text-xl sm:text-2xl font-bold text-center">
                  Metragem aproximada do projeto: {metragemResult} m²
                </h1>
              )}
              <p className="text-[#61794a]/70 text-md sm:text-lg font-semibold capitalize"></p>
            </div>
            <a
              href="https://wa.me/5561982104088?text=Ol%C3%A1!%20Preenchi%20a%20calculadora%20de%20or%C3%A7amento%20da%20Pen%C3%ADnsula%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20"
              target="_blank"
              className="text-white font-semibold bg-[#61794a] p-5 rounded-md scale-95 hover:scale-100 transition-all"
            >
              Fale com a AGE
            </a>
            <p className="text-[#61794a]/70 text-center">
              *Orçamento online possui margens de erro, faça seu orçamento
              realista entrando em contato conosco!
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center"
      style={{
        backgroundImage: 'url("./image1.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'top'
      }}
    >
      <div
        className={`
          mt-6
          rounded-md
          sm:min-h-fit
          w-[94%]
          md:w-5/6
          ${step === 3 ? 'xl:w-3/5' : 'xl:w-2/5'}
          p-5
          mx-auto
          border-0
          sm:rounded-lg
          shadow-lg
          relative
          flex
          flex-col
          justify-center
          bg-[#f1f1f1]
          outline-none
          focus-outline-none
          overflow-hidden
          transition-all
          duration-700
        `}
      >
        {step !== 0 && step < 5 && (
          <div className="w-full flex justify-around items-start mt-10 px:8 sm:px-10">
            <StepMarker
              label={1}
              step={step}
              selected={step >= 1}
              showText={step === 1}
              text={'Contato'}
              line
            />
            <StepMarker
              label={2}
              step={step}
              selected={step >= 2}
              showText={step === 2 || step === 2.5 || step === 2.7}
              text={'Projeto'}
              line
            />
            <StepMarker
              label={3}
              step={step}
              selected={step >= 3}
              showText={step === 3 || step === 3.5}
              text={'Quantidades'}
              line
            />
            <StepMarker
              label={4}
              step={step}
              selected={step >= 4}
              showText={step === 4}
              text={'Finalização'}
            />
          </div>
        )}
        <AnimatePresence mode="wait">{currentForm}</AnimatePresence>
      </div>
    </div>
  )
}

export default App

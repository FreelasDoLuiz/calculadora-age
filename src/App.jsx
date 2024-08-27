import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'

import { getOrçamento } from './calc'

import { ImSpinner2 } from 'react-icons/im'
// import { FaCircleCheck } from 'react-icons/fa6'
import { TbFaceIdError } from 'react-icons/tb'
import { Input } from './components/Input'
import { Button } from './components/Button'
import { CounterInput } from './components/CounterInput'
import { InputSelect } from './components/InputSelect'
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

const encode = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

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
  temPropriedade: z.string().min(1, 'Campo obrigatório.'),
  metrosDaPropriedade: z.string().min(1, 'Campo obrigatório.'),
  tipoDeOrcamento: z.string().min(1, 'Campo obrigatório.'),
  tipoDeProjeto: z.string().min(1, 'Campo obrigatório.')
})

const OptionsDataSchema = z.object({
  padraoDeAcabamento: z.string().min(1, 'Campo obrigatório.'),
  tempoParaIniciarAObra: z.string().min(1, 'Campo obrigatório.'),
  orçamentoDisponivel: z.string().min(1, 'Campo obrigatório.'),
  formaDePagamento: z.string().min(1, 'Campo obrigatório.')
})

function App() {
  const [step, setStep] = useState(4)
  const [result, setResult] = useState(0)
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
    register: propRegister,
    handleSubmit: handlePropSubmit,
    getValues: getPropValues,
    formState: { errors: propErrors },
    watch: watchPropValue,
    setValue: setPropValue
  } = useForm({
    defaultValues: {
      temPropriedade: '',
      metrosDaPropriedade: '',
      tipoDeOrcamento: '',
      tipoDeProjeto: ''
    },
    resolver: zodResolver(PropDataSchema)
  })

  console.log(propErrors)

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
      padraoDeAcabamento: '',
      tempoParaIniciarAObra: '',
      orçamentoDisponivel: '',
      formaDePagamento: ''
    },
    resolver: zodResolver(OptionsDataSchema)
  })

  const phoneNumberValue = watchInfoValue('whatsapp')

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
    const result = getOrçamento(amoutData)
    const encodedData = encode({
      'form-name': 'contact',
      nome: infoData.nome,
      name: infoData.nome,
      email: infoData.email,
      message: `
        name: ${infoData.nome}
        email: ${infoData.email}
        whatsapp: ${infoData.whatsapp}
        temPropriedade: ${propData.temPropriedade}
        metrosDaPropriedade: ${propData.metrosDaPropriedade}
        bairroDeConstrucao: ${propData.bairroDeConstrucao.toString()}
        temProjeto: ${propData.temProjeto.toString()}
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
        padraoDeAcabamento: ${optionsData.padraoDeAcabamento}
        tempoParaIniciarAObra: ${optionsData.tempoParaIniciarAObra}
        orcamentoDisponivel: ${optionsData.orçamentoDisponivel}
        formaDePagamento: ${optionsData.formaDePagamento}
        orcamentoPadraoPrata: ${result.prata}
        orcamentoPadraoOuro: ${result.ouro}
        orcamentoPadraoDiamante: ${result.diamante}
      `
    })
    try {
      setResult({ ...result, selectedPadrao: optionsData.padraoDeAcabamento })
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData
      })

      if (response.status !== 200) {
        setSubmitError(true)
      }
    } catch (err) {
      setSubmitError(true)
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

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
              Calculadora de orçamento de casa no DF
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
                Ao selecionar essa opção você aceita receber informações da
                Península nos contatos informados acima
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
        <form onSubmit={handlePropSubmit(() => setStep((e) => e + 1))}>
          <div className="p-3 sm:p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Sim', value: 'Sim' },
                { label: 'Não', value: 'Não' }
              ]}
              onChange={(e) => setPropValue('temPropriedade', e)}
              value={watchPropValue('temPropriedade')}
              error={propErrors.temPropriedade}
              label="Possui terreno/imóvel para o projeto?"
            />
            <InputSelect
              options={[
                { label: 'Não possuo', value: 'Nao possuo' },
                { label: '0 a 25 m²', value: '0 a 25 m²' },
                { label: '25 a 100 m²', value: '25 a 100 m²' },
                { label: '100 a 200 m²', value: '100 a 200 m²' },
                { label: '+200 m²', value: '+200 m²' }
              ]}
              onChange={(e) => setPropValue('metrosDaPropriedade', e)}
              value={watchPropValue('metrosDaPropriedade')}
              error={propErrors.metrosDaPropriedade}
              label="Qual a metragem do projeto?"
            />
            <InputSelect
              options={[
                {
                  label: 'Projeto arquitetônico',
                  value: 'Projeto arquitetônico'
                },
                {
                  label: 'Projeto essencial de engenharia',
                  value: 'Projeto essencial de engenharia'
                }
              ]}
              onChange={(e) => setPropValue('tipoDeOrcamento', e)}
              value={watchPropValue('tipoDeOrcamento')}
              error={propErrors.tipoDeOrcamento}
              label="Tipo de orçamento:"
            />
            <Input
              id="tipoDeProjeto"
              label="Qual o tipo de imóvel que será realizado o projeto?"
              required
              register={propRegister}
              error={propErrors.tipoDeProjeto}
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
  } else if (step === 3) {
    currentForm = (
      <motion.form
        key="step-4"
        onSubmit={handleAmountSubmit(() => setStep((e) => e + 1))}
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
            title="Suíte Master - 35m²"
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
            title="Suíte - 30m²"
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
            title="Quarto - 16m²"
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
            title="Sala de estar - 20m²"
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
            title="Escritório - 16m²"
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
            title="Cozinha - 20m²"
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
            title="Sala de jantar - 20m²"
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
            title="Lavabo - 3m²"
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
            title="Home - 16m²"
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
            title="Área gourmet - 40m²"
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
            title="Garagem Coberta - 20m²"
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
            title="Roupeiro - 5m²"
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
            title="Depósito - 6m²"
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
            title="Piscina - 40m²"
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
            buttonAction={() => setStep((e) => e - 1)}
          />
          <Button label="Próximo" type="submit" />
        </div>
      </motion.form>
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
                { label: 'Marcenaria e Pedras', value: 'Marcenaria e Pedras ' },
                { label: 'Marcenaria', value: 'Marcenaria' },
                {
                  label: 'Pedras',
                  value: 'Pedras'
                },
                { label: 'Não', value: 'Não' }
              ]}
              onChange={(e) => setOptionsValue('orçamentoDisponivel', e)}
              value={watchOptionsValue('orçamentoDisponivel')}
              error={optionsErrors.orçamentoDisponivel}
              label="Detalhamento de interior?"
            />
            <InputSelect
              options={[
                { label: 'Prata (padrão inicial)', value: 'prata' },
                { label: 'Ouro (padrão intermediário)', value: 'ouro' },
                { label: 'Diamante (padrão luxo)', value: 'diamante' }
              ]}
              onChange={(e) => setOptionsValue('padraoDeAcabamento', e)}
              value={watchOptionsValue('padraoDeAcabamento')}
              error={optionsErrors.padraoDeAcabamento}
              label="Qual o padrão de acabamento?"
            />
            <InputSelect
              options={[
                { label: 'Em até 6 meses', value: 'ate 6 meses' },
                { label: 'Entre 6 e 12 meses', value: 'Entre 6 e 12 meses' },
                { label: 'Após 12 meses', value: 'Após 12 meses' }
              ]}
              onChange={(e) => setOptionsValue('tempoParaIniciarAObra', e)}
              value={watchOptionsValue('tempoParaIniciarAObra')}
              error={optionsErrors.tempoParaIniciarAObra}
              label="Quando pretende iniciar o projeto?"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-20">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 1)}
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
            <p className="text-white text-center">
              Enviando suas informações...
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
                Seu orçamento final:
              </h1>
              <p className="text-[#61794a]/70 text-md sm:text-lg font-semibold capitalize">
                R$: {result[getOptionsValue('padraoDeAcabamento')]},00
              </p>
            </div>
            <a
              href="https://wa.me/5561982104088?text=Ol%C3%A1!%20Preenchi%20a%20calculadora%20de%20or%C3%A7amento%20da%20Pen%C3%ADnsula%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20"
              target="_blank"
              className="text-white font-semibold bg-blue-500 p-5 rounded-md scale-95 hover:scale-100 transition-all"
            >
              Fale com a AGE
            </a>
            <p className="text-[#61794a]/70 text-center">
              *orçamento online possui margens de erro, faça seu orçamento
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
              showText={step === 2}
              text={'Projeto'}
              line
            />
            <StepMarker
              label={3}
              step={step}
              selected={step >= 3}
              showText={step === 3}
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

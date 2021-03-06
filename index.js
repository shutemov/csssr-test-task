/**
 * Представим, что на одном из проектов нам потребовался DSL для решения бизнес-задачи. Наши пользователи - большие поклонники Lisp, поэтому синтаксис этого языка им более привычен, чем синтаксис JS.
 * Парсер оригинального синтаксиса Lisp нам написать хоть и не так сложно, но все же для MVP это может быть неразумно, а вот простенький интерпретатор нам точно будет полезен.
 *
 * Что мы хотим получить:
 * 1. Возможность объявлять функции таким образом: [defn, 'funcName', ['a', 'b'], ['sum', 'a', 'b']], где
 *      defn - ключевое слово для определения функции
 *      'funcName' - имя функции
 *      ['a', 'b'] - перечисление аргументов функции
 *      ['sum', 'a', 'b'] - тело функции (т. е. вызов функции sum с аргументами a и b)
 * 2. Соответственно вызов функции должен быть таким ['funcName', 'a', 'b']
 *
 * Ниже уже реализован некоторый runtime и есть пример вызова interpret. Необходимо имплементировать interpret и defn.
 *
 * P.S.
 * Даже если не получится выполнять задание в полной мере (например, где-то застряли), все равно скидывайте в качестве решения то, что получилось.
 */

const definedFunctions = new Map()

const invokedFunctions = []

/*
    набор валидаторов для объявления функции:
        1. функция не определена,
        2. пропуск аргумента,
        3. большее кол. аргументов.
*/
const ensureDefnParams = (line, index) => {
    const [, funcName, args, body] = line
    if (typeof funcName !== 'string') throw new TypeError(`The function name must be a string, got ${typeof funcName} in line: ${index + 1}`)
    if (definedFunctions.has(funcName)) throw  new SyntaxError(`A function named '${funcName}' has been declared in line: ${index + 1}\``)
    if (!Array.isArray(args)) throw  new TypeError(`The function args must be a Array, got ${typeof args} in line: ${index + 1}`)
    if (!Array.isArray(body)) throw  new TypeError(`The function args must be a Array, got ${typeof body} in line: ${index + 1}`)
}

/*
    набор валидаторов для вызова функции:
        1. функция не определена,
        2. пропуск аргумента,
        3. большее кол. аргументов.
*/
const ensureInvokeParams = (line, index) => {
    const [funcName, ...passedFuncArgs] = line
    const definedFunction = definedFunctions.get(funcName)
    if (!definedFunction) throw new Error(`Function '${funcName}' not defined in line:${index + 1}`)
    if (definedFunction.args.length > passedFuncArgs.length) throw new SyntaxError(`You missed the argument '${definedFunction.args[passedFuncArgs.length]}' when calling the function '${funcName}' in line: ${index + 1}`)
    if (definedFunction.args.length < passedFuncArgs.length) throw new SyntaxError(`You passed more arguments than required for the function '${funcName}' in line: ${index + 1}`)
}

const invokedFunctionsAdd = (func) => {
    const invokedFunc = Object.assign({}, func)
    invokedFunctions.push(invokedFunc)
}

const showReportOfInterpreterWork = () => {
    console.log('Interpreter finish:')
    console.log('>>> definedFunctions', definedFunctions)
    console.log('>>> invokedFunctions', invokedFunctions)
    console.log('-----------------------------')
}

const storeCleaner = () => {
    definedFunctions.clear()
    invokedFunctions.length = 0
}


/*
    Объявленные функции держим в мапе definedFunctions, содержающую:
        1. ссылку на рантайм функцию
        2. результат
        3. кол. аргументов объявленной функции
        3. кол. аргументов тела функции
 */
const defn = (functionName, args, body) => {
    const [refToFunc, ...bodyArgs] = body

    // кол. параметров тела функции может быть больше, чем кол. параметров объявленной функции,
    // подразумевая, что мы хотим использовать константу
    const isFitArgs = (bodyArgs.length === args.length) || (bodyArgs.length > args.length)

    if (!isFitArgs) {
        throw new SyntaxError(`Invalid number of parameters in the function '${functionName}' body`)
    }

    definedFunctions.set(functionName, {
        execute: refToFunc,
        result: undefined,
        args: args,
        bodyArgs: bodyArgs
    })
}

/*
    Интерпретирует по типу данных (Array, Reference, String)
    подразумевает, что этап лексинга не нужен и мы сразу парсим код.

    На вход подается N массивов. Каждый массив воспринимается как строка кода.

    В зависимости от вида кода, возвращает:
        1. результат выполения 1 объявленной и вызванной функции;
        2. Копию массива вызова функций с результатом их выполнения.
 */
const interpret = (...code) => {
    for (let index = 0; index < code.length; index++) {
        let line = code[index]

        if (!Array.isArray(line)) {
            throw new SyntaxError(`Expected Array, got other in line: ${index + 1}`)
        }

        const isDefn = line[0] === defn
        const isInvoke = typeof line[0] === 'string'

        // парсим вариант с объявлением
        if (isDefn) {
            ensureDefnParams(line, index)
            const [defn, funcName, args, body] = line

            /*
                bodyFunc может быть:
                    1.ссылкой на рантайм функцию,
                    2.строкой с называнием ранее объявленной функции
             */
            const [bodyFunc] = body

            const expectedDeclaredFunction = typeof bodyFunc === 'string'
            if (!expectedDeclaredFunction) {
                defn(funcName, args, body)
                continue
            }

            const definedFunc = definedFunctions.get(bodyFunc)
            if (!definedFunc) throw new Error(`Function '${funcName}' not defined in line:${index + 1}`)

            //заменяем текстовое название функции ссылкой на рантайм функцию
            body[0] = definedFunc.execute

            defn(funcName, args, body)
        }
        // парсим вариант с вызовом
        else if (isInvoke) {
            ensureInvokeParams(line, index)

            const [funcName, ...passedFuncArgs] = line

            const definedFunction = definedFunctions.get(funcName)

            const isBodyFuncHasConst = passedFuncArgs.length < definedFunction.bodyArgs.length

            if (!isBodyFuncHasConst) {
                definedFunction.result = definedFunction.execute(...passedFuncArgs)
                invokedFunctionsAdd(definedFunction)
                continue
            }

            //считаем, что все, что не стринг является константным значением.
            const constArgs = definedFunction.bodyArgs.filter(arg => {
                return typeof arg !== 'string'
            })

            //объединяем переданные значения аргументов с константными
            const totalArgs = passedFuncArgs.concat(constArgs)
            definedFunction.result = definedFunction.execute(...totalArgs)

            invokedFunctionsAdd(definedFunction)
        } else {
            throw new SyntaxError(`Expected String or Reference, got other in line: ${index + 1}`)
        }
    }

    /*
        При 1 объявлении фукнции и ее последующего вызова, сразу возвращаем результат,
        иначе возвращаем мапу функций и результатов выполнения.
     */
    if (definedFunctions.size === 1) {
        let localResult = undefined

        definedFunctions.forEach((value) => {
            localResult = value.result
        })

        return localResult
    }

    const result = [...invokedFunctions]

    showReportOfInterpreterWork()
    storeCleaner()

    return result
}

// Функция, используемая в runtime
const sum = (...args) => args.reduce((prev, curr) => prev + curr)

try {
    // Пример 1. Кейс из задания.
    const result = interpret(
        [defn, 'sum3', ['a', 'b', 'c'], [sum, 'a', 'b', 'c']],
        ['sum3', 10, 20, 30],
    )

    // Пример 2. Кейс с применением константы. (константой является доп. аргумент в теле функции)
    const result2 = interpret(
        [defn, 'sum3WithConst', ['a', 'b'], [sum, 'a', 'b', 4]],
        ['sum3WithConst', 2, 3],
    )

    // Пример 3. Кейс с использованием уже ранее объявленной функции.
    const result3 = interpret(
        [defn, 'childFunc', ['a', 'b'], [sum, 'a', 'b']],
        [defn, 'parentSum', ['a', 'b'], ['childFunc', 'a', 'b']],
        ['parentSum', 2, 2],
    )

    // Пример 4. Кейс с использованием уже ранее объявленной функции и константой.
    const result4 = interpret(
        [defn, 'sum2', ['a', 'b'], [sum, 'a', 'b']],
        [defn, 'add4', ['number'], ['sum2', 4, 'number']],
        ['add4', 0],
        ['add4', 4],
        ['add4', 8]
    )

    console.log('[results]')
    console.log('result 1', result)
    console.log('result 2', result2)
    console.log('result 3', result3)
    console.log('result 4', result4)

    console.assert(result === 60)
} catch (e) {
    console.error(e)
}


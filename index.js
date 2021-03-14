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
        } else {
            throw new SyntaxError(`Expected String or Reference, got other in line: ${index + 1}`)
        }
    }
    }
}

// Функция, используемая в runtime
const sum = (...args) => args.reduce((prev, curr) => prev + curr)



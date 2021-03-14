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
    Объявленные функции держим в мапе definedFunctions, содержающую:
        1. ссылку на рантайм функцию
        2. результат
        3. кол. аргументов объявленной функции
        3. кол. аргументов тела функции
 */
const defn = (functionName, args, body) => {
    // требуется реализация
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

const interpret = (...code) => {
    // требуется реализация
}

// Функция, используемая в runtime
const sum = (...args) => args.reduce((prev, curr) => prev + curr)

// Пример вызова функции interpret
const result = interpret(
    [defn, "sum3", ['a', 'b', 'c'], [sum, 'a', 'b', 'c']],
    ['sum3', 10, 20, 30]
)

console.assert(result === 60)

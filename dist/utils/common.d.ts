/**
 * other
 * Log Messages
 * @param {Object} {} err、message、time
 */
declare function handleDefault({ err, message, time }?: any): any;
/**
 * Type
 * @param {anything} param value
 * [object String]\[object Number]\[object Array]\[object Object]\[object Promise]
 * [object Boolean]\[object Undefined]\[object Null]\[object Date]\[object Function]
 * [object RegExp]\[object Error]\[object HTMLDocument]\[object global]\[object Symbol]\[object Set]
 */
declare function judgeType(param: any): string;
declare const levels: {
    color: string;
    icon: string;
    type: string;
}[];
export { handleDefault, judgeType, levels };

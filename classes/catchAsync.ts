export const catchAsync = (fn: (arg0: any, arg1: any, arg2: any) => { catch: (arg0: any) => void; }) => {
    return ( req: any, res: any, next: any ) => {
        fn( req, res, next ).catch( next );
    }
}
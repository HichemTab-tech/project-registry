import {confirm, input, select} from '@inquirer/prompts'

export const prompts: {
    confirm: typeof confirm
    input: typeof input
    select: typeof select
} = {
    confirm,
    input,
    select,
}
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils.ts'

type PageLayoutProps = {} & ComponentPropsWithoutRef<'main'>

export function PageLayout(props: PageLayoutProps) {
    const { children, className, ...rest } = props

    return (
        <main className={cn(className, 'container mx-auto h-dvh p-6')} {...rest}>
            <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
            {children}
        </main>
    )
}

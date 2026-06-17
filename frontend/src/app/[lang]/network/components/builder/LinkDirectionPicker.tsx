import { memo, useState } from "react"
import { Button, Divider, CardBody } from "@heroui/react"
import classNames from "classnames"

const SIZE_MAP: Record<string, Record<number, number>> = {
    decreases: { 1: 40, 2: 25, 3: 10 },
    increases: { 1: 60, 2: 75, 3: 90 },
}

const sizeToDirection = (size: number | null): string | null => {
    if (size === null || size === undefined) return null
    if (size < 50) return 'decreases'
    if (size > 50) return 'increases'
    return 'no-effect'
}

const sizeToStrength = (size: number | null): number | null => {
    if (size === null || size === undefined || size === 50) return null
    const dist = Math.abs(size - 50)
    if (dist <= 17) return 1
    if (dist <= 32) return 2
    return 3
}

interface LinkDirectionPickerProps {
    sourceNode: any
    targetNode: any
    linkSize: number | null
    linkIndex: number
    handleChange: (args: any) => void
    labels: any
    error: any
    responseDirection: string
    nodeColor?: string
}

const LinkDirectionPicker = memo(({
    sourceNode,
    targetNode,
    linkSize,
    linkIndex,
    handleChange,
    labels,
    error,
    responseDirection,
    nodeColor,
}: LinkDirectionPickerProps) => {
    const [direction, setDirection] = useState<string | null>(() => sizeToDirection(linkSize))
    const [strength, setStrength] = useState<number | null>(() => sizeToStrength(linkSize))

    const isTouched = linkSize !== null && linkSize !== undefined
    const isError = !isTouched && !!error

    const label = responseDirection === "incoming"
        ? sourceNode.causePrompt
        : targetNode.causePrompt

    const directionOptions = [
        { key: 'decreases', label: labels?.decreasesLabel || 'Decreases' },
        { key: 'no-effect', label: labels?.noEffectLabel || 'No effect' },
        { key: 'increases', label: labels?.increasesLabel || 'Increases' },
    ]

    const strengthOptions = [
        { key: 1, label: labels?.weakLabel || 'Weak' },
        { key: 2, label: labels?.moderateLabel || 'Moderate' },
        { key: 3, label: labels?.strongLabel || 'Strong' },
    ]

    const handleDirectionSelect = (dir: string) => {
        setDirection(dir)
        if (dir === 'no-effect') {
            setStrength(null)
            handleChange({ value: 50, source: sourceNode.id, target: targetNode.id, index: linkIndex })
        } else if (strength !== null) {
            handleChange({ value: SIZE_MAP[dir][strength], source: sourceNode.id, target: targetNode.id, index: linkIndex })
        }
    }

    const handleStrengthSelect = (str: number) => {
        setStrength(str)
        if (direction && direction !== 'no-effect') {
            handleChange({ value: SIZE_MAP[direction][str], source: sourceNode.id, target: targetNode.id, index: linkIndex })
        }
    }

    return (
        <>
            <Divider />
            <CardBody className={classNames("py-2 sm:py-3", { 'bg-red-50': isError })}>
                <h3
                    className={classNames("text-sm sm:text-base font-medium mb-3", { 'text-red-700': isError })}
                    style={!isError && nodeColor ? { color: nodeColor } : undefined}
                    dangerouslySetInnerHTML={{ __html: label }}
                />
                <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {labels?.directionRowLabel || 'Effect direction'}
                    </span>
                    <div className="flex gap-2 mt-1">
                        {directionOptions.map(opt => {
                            const isSelected = direction === opt.key
                            const color = isSelected
                                ? opt.key === 'decreases' ? 'danger'
                                  : opt.key === 'increases' ? 'success'
                                  : 'default'
                                : 'default'
                            return (
                                <Button
                                    key={opt.key}
                                    size="sm"
                                    variant={isSelected ? 'solid' : 'bordered'}
                                    color={color as any}
                                    onPress={() => handleDirectionSelect(opt.key)}
                                    className="flex-1 min-w-0"
                                >
                                    {opt.label}
                                </Button>
                            )
                        })}
                    </div>
                </div>
                {direction && direction !== 'no-effect' && (
                    <div className="linkRatingStrengthSection">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {labels?.strengthRowLabel || 'Effect strength'}
                        </span>
                        <div className="flex gap-2 mt-1">
                            {strengthOptions.map(opt => {
                                const isSelected = strength === opt.key
                                const color = isSelected
                                    ? direction === 'decreases' ? 'danger' : 'success'
                                    : 'default'
                                return (
                                    <Button
                                        key={opt.key}
                                        size="sm"
                                        variant={isSelected ? 'solid' : 'bordered'}
                                        color={color as any}
                                        onPress={() => handleStrengthSelect(opt.key)}
                                        className="flex-1 min-w-0"
                                    >
                                        {opt.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardBody>
        </>
    )
})

LinkDirectionPicker.displayName = "LinkDirectionPicker"

export default LinkDirectionPicker

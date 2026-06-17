import { Card, CardHeader, CardBody } from "@heroui/react"

interface GraphReviewStepProps {
    content: any
}

const GraphReviewStep = ({ content }: GraphReviewStepProps) => {
    return (
        <Card className="graphReviewStep flex-grow">
            <CardHeader className="flex flex-col items-start py-1 sm:py-3">
                <h2 className="text-xl font-semibold">
                    {content?.reviewStep?.header || 'Review your connections'}
                </h2>
            </CardHeader>
            <CardBody className="text-sm text-gray-600 pt-0">
                <p>{content?.reviewStep?.instructions || 'Click any node in the graph to edit its connections, then press Next to continue.'}</p>
            </CardBody>
        </Card>
    )
}

export default GraphReviewStep

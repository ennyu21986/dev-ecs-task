import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';


export class DevEcsTaskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC作成
    const vpc = new ec2.Vpc(this, 'ecs-vpc', {
      cidr: "10.210.0.0/16"
    });
    // ECS Cluster作成
    const cluster = new ecs.Cluster(this, 'cluster', {
      vpc
    });

    // ClusterにAutoScalingGroupなt3.microを追加
    cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      instanceType: new ec2.InstanceType("t3.micro"),
      desiredCapacity: 4
    });

    // タスク定義作成
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');

    // タスク定義設定
    taskDefinition.addContainer('DefaultContainer', {
      image: ecs.ContainerImage.fromRegistry("nginx:1.19.2-alpine"),
      memoryLimitMiB: 256,
      cpu: 128
    }).addPortMappings({
      containerPort: 80
    });
    // ECS Service作成
    const ecsService = new ecs.Ec2Service(this, 'Service', {
      cluster,
      taskDefinition
    });
     // LoadBalancer作成
     const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      internetFacing: true
    });

    // TargetGroup作成
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 80
    });

    // LoadBanacerと紐付け
    loadBalancer.addListener('Listener', {
      port: 80,
      defaultTargetGroups: [targetGroup]
    })
    // TargetGroupとECS Serviceを紐付け
    targetGroup.addTarget(ecsService);

  }
}

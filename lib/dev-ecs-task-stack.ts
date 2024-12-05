import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

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


  }
}

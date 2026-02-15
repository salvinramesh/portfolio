// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    console.log('🚀 STRAPI BOOTSTRAP STARTED 🚀');

    try {
      // 1. Seed Profile
      const profileCount = await strapi.db.query('api::profile.profile').count();
      if (profileCount === 0) {
        await strapi.db.query('api::profile.profile').create({
          data: {
            name: 'Salvin',
            title: 'IT Engineer – Infrastructure & Systems Operations',
            bio: `**Professional Summary**\n\nHands-on IT Engineer with strong experience in Linux server administration, enterprise application hosting, SAP environments, networking, security hardening, and automation. Skilled in deploying, managing, and troubleshooting production systems with a focus on stability, performance, and security. Experienced in end-to-end infrastructure support, from hardware to application layer.`,
            publishedAt: new Date(),
          },
        });
        console.log('✅ SEEDED: Profile');
      }

      // 2. Seed Experience (Core Responsibilities)
      const experienceCount = await strapi.db.query('api::experience.experience').count();
      if (experienceCount === 0) {
        // Create one main entry for the "Core Responsibilities"
        await strapi.db.query('api::experience.experience').create({
          data: {
            role: 'IT Engineer',
            company: 'Core Responsibilities', // Using this as a section header since it's a summary
            description: `**System Administration**
- Install, configure, and maintain Linux servers (SUSE Linux Enterprise / SLES)
- Manage boot processes, services, and startup configurations
- Monitor CPU, memory, disk, and network utilization
- Perform regular system updates, patching, and upgrades
- Handle log analysis and root cause troubleshooting
- Manage users, permissions, and access control

**Application & SAP Operations**
- Deploy and maintain enterprise applications and SAP workloads
- Configure environments for production, testing, and staging
- Troubleshoot application performance and service issues
- Coordinate with functional teams for system availability
- Manage application lifecycle: install → configure → maintain → upgrade

**Networking & Connectivity**
- Configure and manage network infrastructure (routers, switches, Wi-Fi APs)
- Deploy enterprise access points (e.g., Ubiquiti U6 LR)
- Troubleshoot LAN/WAN, DNS, and connectivity problems
- Optimize bandwidth and coverage for office environments
- Ensure secure internal and remote connectivity

**Security & Hardening**
- Configure firewalls (UFW/iptables)
- Implement TLS/SSL encryption
- Secure remote access solutions (RustDesk, SSH, VPN)
- Enforce least-privilege access policies
- Apply security patches and vulnerability fixes
- Monitor systems for suspicious activities

**Automation & Scripting**
- Create shell scripts to automate repetitive admin tasks
- Automate service startup and system configuration
- Build custom installation scripts for servers and tools
- Reduce manual intervention and improve operational efficiency

**Monitoring & Reliability**
- Monitor uptime and service availability
- Implement proactive maintenance
- Perform backup verification and recovery planning
- Handle incident management and quick restoration
- Ensure minimal downtime for critical services

**IT Support & Troubleshooting**
- Provide L2/L3 technical support to users and internal teams
- Diagnose hardware and OS issues
- Manage system performance tuning
- Handle data recovery coordination
- Document solutions and create knowledge base articles

**Coordination & Operations**
- Work closely with cross-functional teams
- Track tasks and timelines
- Provide timely updates and status reports
- Maintain infrastructure documentation
- Support audits and compliance requirements`,
            current: true,
            startDate: new Date(), // Just to satisfy type if needed, or leave null if optional
            publishedAt: new Date(),
          },
        });
        console.log('✅ SEEDED: Experience');
      }

      // 3. Seed Skills
      const skillCount = await strapi.db.query('api::skill.skill').count();
      if (skillCount === 0) {
        const skills = [
          { name: 'SUSE Linux Enterprise (SLES)', category: 'DevOps', proficiency: 95, icon: 'Server' },
          { name: 'Linux Administration', category: 'DevOps', proficiency: 90, icon: 'Terminal' },
          { name: 'Bash Scripting', category: 'Languages', proficiency: 85, icon: 'Code' },
          { name: 'Systemd', category: 'Tools', proficiency: 85, icon: 'Cpu' },
          { name: 'RustDesk', category: 'Tools', proficiency: 90, icon: 'Globe' },
          { name: 'TLS/SSL', category: 'DevOps', proficiency: 80, icon: 'Lock' },
          { name: 'UFW / Firewalls', category: 'Backend', proficiency: 85, icon: 'Lock' },
          { name: 'Ubiquiti APs', category: 'Tools', proficiency: 85, icon: 'Globe' },
          { name: 'Log Monitoring', category: 'Tools', proficiency: 80, icon: 'Database' },
          { name: 'TCP/IP, DNS, DHCP', category: 'Backend', proficiency: 85, icon: 'Server' },
          { name: 'Wi-Fi Deployment', category: 'Tools', proficiency: 90, icon: 'Globe' },
          { name: 'Backup & Recovery', category: 'DevOps', proficiency: 85, icon: 'Database' },
          { name: 'Performance Tuning', category: 'DevOps', proficiency: 80, icon: 'Cpu' },
          { name: 'Hardware Troubleshooting', category: 'Tools', proficiency: 90, icon: 'Cpu' },
        ];

        for (const skill of skills) {
          await strapi.db.query('api::skill.skill').create({
            data: { ...skill, publishedAt: new Date() },
          });
        }
        console.log('✅ SEEDED: Skills');
      }

      // 4. Seed Projects
      const projectCount = await strapi.db.query('api::project.project').count();
      if (projectCount === 0) {
        const projects = [
          {
            title: 'IT Inventory Management System',
            description: 'A comprehensive proprietary tool developed for managing hardware assets, server racks, and device lifecycles. Features real-time tracking, barcode scanning integration, and automated depreciation calculation.',
            techStack: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
            imageUrl: '/project-images/inventory.png',
            liveLink: '#',
            githubLink: '#',
            publishedAt: new Date(),
          },
          {
            title: 'Internal Wiki System',
            description: 'Secure, centralized knowledge base for documenting internal procedures, technical manuals, and troubleshooting guides. Implements Role-Based Access Control (RBAC) and full-text search.',
            techStack: ['Node.js', 'React', 'Elasticsearch', 'MongoDB'],
            imageUrl: '/project-images/wiki.png',
            liveLink: '#',
            githubLink: '#',
            publishedAt: new Date(),
          },
          {
            title: 'Secure VPN Tunneling',
            description: 'Enterprise-grade VPN solution enabling secure remote access for distributed teams. optimized for low latency and high throughput using WireGuard protocol with custom management web UI.',
            techStack: ['WireGuard', 'Linux', 'Bash', 'Golang'],
            imageUrl: '/project-images/vpn.png',
            liveLink: '#',
            githubLink: '#',
            publishedAt: new Date(),
          },
          {
            title: 'Task Automation & Chat Bots',
            description: 'Suite of automated bots for Slack/Teams to handle routine IT tasks such as ticket creation, server status checks, and user onboarding workflows. Reducing manual workload by 40%.',
            techStack: ['Python', 'AWS Lambda', 'Slack API', 'Terraform'],
            imageUrl: '/project-images/automation.png',
            liveLink: '#',
            githubLink: '#',
            publishedAt: new Date(),
          },
        ];

        for (const project of projects) {
          await strapi.db.query('api::project.project').create({
            data: project,
          });
        }
        console.log('✅ SEEDED: Projects');
      }

      // 5. Enable Public Permissions
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const permissions = [
          'api::profile.profile.find',
          'api::profile.profile.findOne',
          'api::experience.experience.find',
          'api::experience.experience.findOne',
          'api::skill.skill.find',
          'api::skill.skill.findOne',
          'api::project.project.find',
          'api::project.project.findOne',
          'api::article.article.find',
          'api::article.article.findOne',
        ];

        await Promise.all(permissions.map(async (action) => {
          const permissionExists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

          if (!permissionExists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`✅ ENABLED PERMISSION: ${action}`);
          }
        }));
      }
    } catch (error) {
      console.error('❌ BOOTSTRAP ERROR:', error);
    }
    // Seed Articles
    const articleCount = await strapi.db.query('api::article.article').count();
    if (articleCount === 0) {
      const articles = [
        {
          title: "The Future of Neural Interfaces in Web Development",
          slug: "neural-interfaces-web-dev",
          summary: "Exploring how BCI (Brain-Computer Interfaces) will change the way we write code.",
          content: "## Direct Neural Links\n\nImagine writing code by thought alone. The latency between concept and execution drops to zero. We are approaching a singularity where the IDE is no longer a tool, but an extension of the mind.\n\n### The Stack\n- EEG Sensors\n- WebBluetooth API\n- Real-time Visualizers\n\nThis is not sci-fi. It is the next sprint.",
          publishedAt: new Date(),
          tags: ["Future Tech", "BCI", "Web3"]
        },
        {
          title: "Optimizing Serverless Architecture for Deep Space Comms",
          slug: "serverless-deep-space",
          summary: "Handling high-latency, radiation-hardened computing clusters near Jupiter.",
          content: "## Lag is a Feature, Not a Bug\n\nWhen light takes 40 minutes to reach the server, your retry logic needs to be... patient. We explore the use of CRDTs and eventual consistency in interplanetary networks.",
          publishedAt: new Date(),
          tags: ["Space", "Serverless", "Latency"]
        },
        {
          title: "Hacking the Mainframe: A Retrospective",
          slug: "hacking-mainframe",
          summary: "Case study on the 2025 firewall breach simulation.",
          content: "## The Breach\n\nIt started with a simple SQL injection. It ended with full root access. This article breaks down the vulnerabilities found in legacy Cobol systems wrapping modern APIs.",
          publishedAt: new Date(),
          tags: ["Security", "Red Team", "Case Study"]
        }
      ];

      for (const article of articles) {
        await strapi.service('api::article.article').create({ data: article });
      }
      strapi.log.info('🚀 Seeded Articles');
    }
  },
};

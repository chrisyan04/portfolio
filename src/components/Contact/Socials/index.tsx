import React from "react";
import { Badge, Avatar } from "@nextui-org/react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Socials() {
  return (
    <section
      id="socials"
      className="mt-24 flex items-center justify-center pb-20"
    >
      <div className="grid sm:grid-cols-4 grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 1 },
          }}
          whileHover={{ scale: 0.9 }}
          viewport={{ once: false }}
        >
          <Link href="https://github.com/chrisyan04" target="_blank">
            <Badge content="20" className="h-8 w-12 text-lg" color="danger">
              <Avatar
                isBordered
                radius="full"
                className="w-24 h-24 text-large"
                src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
              />
            </Badge>
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 1 },
          }}
          whileHover={{ scale: 0.9 }}
          viewport={{ once: false }}
        >
          <Link href="https://www.instagram.com/chris.yan_/" target="_blank">
            <Badge content="69" className="h-8 w-12 text-lg" color="danger">
              <Avatar
                isBordered
                radius="full"
                className="w-24 h-24 text-large"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png?20200512141346"
              />
            </Badge>
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 1 },
          }}
          whileHover={{ scale: 0.9 }}
          viewport={{ once: false }}
        >
          <Link
            href="https://www.linkedin.com/in/chris-cx-yan/"
            target="_blank"
          >
            <Badge content="99+" className="h-8 w-12 text-lg" color="danger">
              <Avatar
                isBordered
                radius="full"
                className="w-24 h-24 text-large"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/144px-LinkedIn_icon.svg.png?20210220164014"
              />
            </Badge>
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 100,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 1 },
          }}
          whileHover={{ scale: 0.9 }}
          viewport={{ once: false }}
        >
          <Link
            href="https://www.eliteprospects.com/player/569280/chris-yan"
            target="_blank"
          >
            <Badge content="17" className="h-8 w-12 text-lg" color="danger">
              <Avatar
                isBordered
                radius="full"
                className="w-24 h-24 text-large"
                src="https://pbs.twimg.com/profile_images/1712514290186428416/3YABXwSG_400x400.jpg"
              />
            </Badge>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}